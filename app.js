const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});

const hbs = require("hbs");
app.set("view engine", "hbs");
hbs.registerPartials(__dirname+"/views/partials");
app.use(express.static(__dirname+"/public"));

hbs.registerHelper('isnotundefined', function(par){
    if (typeof par!=='undefined') return par;
    else return undefined;
});

hbs.registerHelper('insotnull', function(par){
    if (par.replace(/\s/gi,'')!==null) return par;
    else return undefined;
});

hbs.registerHelper('isis', function(first, second, options){
    return (first === second) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('summi', function(first, second){
    return first*second;
});

const express_session = require("express-session");
app.use(express_session(
    {secret:"SecretOfPower", 
    cookie: {maxage: 8600*60*60*60}, 
    saveUninitialized: true, 
    resave: true}));

const mysql = require("mysql2");

function database_connection()
{
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "powermax_db",
        debug: false,
        multipleStatements: true
        });
    
    return connection;
}

//Готово
app.get("/", function(request, response){

    var connection = database_connection();
    connection.query("SELECT * from categories;", function(err, data){       
        if(err)
        console.log(err)

        connection.end();
        response.render("index", {categories:data, sessionExist: request.session.login});
    });  
});
//Готово
app.get("/sendpay", function(request,response){

    response.render("sendpay",{sessionExist: request.session.login});
});
//Готово
app.get("/contacts", function(request,response){

    response.render("contacts", {sessionExist: request.session.login});
});
//Готово
app.get("/catalog", function(request,response){

    var connection = database_connection();
    connection.query("SELECT * from categories;SELECT img, product_name, price, id_product from products;",[1,2], function(err, data){       
        if(err)
        console.log(err)

        console.log(data[0]);
        connection.end();
        response.render("catalog", {categories:data[0], products:data[1], sessionExist: request.session.login});
    });  
});
//Готово
app.get("/category/:id", function(request,response){

    var connection = database_connection();
    connection.query("SELECT * from categories;SELECT img, product_name, price, id_product from products where category_id='"+ request.url.replace(/\D/gi,'')+"';",[1,2], function(err, data){       
        if(err)
        console.log(err)

        console.log(data[1]);
        connection.end();
        response.render("category", {categories:data[0], products:data[1], sessionExist: request.session.login});
    });  
});
//Готово
app.get("/product/:id", function(request,response){

    var connection = database_connection();
    connection.query("SELECT * from categories;SELECT * from products where id_product='"+ request.url.replace(/\D/gi,'')+"';",[1,2], function(err, data){       
        if(err)
        console.log(err)

        connection.end();
        response.render("product", {categories:data[0], product:data[1][0], sessionExist: request.session.login});
    });  
});
//Готово
app.get("/log", function(request,response){

    response.render("log", {sessionExist: request.session.login});
});
//Готово
app.get("/reg", function(request,response){

    response.render("reg", {sessionExist: request.session.login});
});
//Готово
app.get("/profile", function(request,response){

    var connection = database_connection();

    connection.query("SELECT id_order, sum from orders a inner join users b on a.id_user=b.id_user where phone_number='"+request.session.login+"';SELECT a.id_order, d.id_product, quantity, price, product_name from orders a inner join basket b on a.id_order=b.id_order inner join users c on a.id_user=c.id_user INNER JOIN products d on b.id_product=d.id_product WHERE b.id_order is not null and c.phone_number='"+request.session.login+"'", [1,2], function(err,data){

        if(err)
        console.log(err);

        console.log(data[1]);
        connection.end();
        response.render("profile", {orders:data[0], contain:data[1], sessionExist: request.session.login});
    });
    
});
//Готово
app.get("/basket", function(request,response){

    var connection = database_connection();
    connection.query("SELECT a.id_basket, a.quantity, c.id_product, c.product_name,c.img,c.price FROM basket a INNER JOIN users b on a.id_user=b.id_user inner join products c on a.id_product=c.id_product where b.phone_number='"+request.session.login+"' and a.id_order is null", function(err, data){       
        if(err)
        console.log(err)

        connection.end();
        var summ=0;

        data.forEach(element =>{
            summ+=parseInt(element.price)*parseInt(element.quantity);
        })

        response.render("basket", {basket:data, summ:summ, sessionExist: request.session.login});
    }); 
});
//Готово
app.get("/exit", function(request,response){
    request.session.destroy();
    response.redirect("/");
});
//Готово
app.post("/log", urlencodedParser, function(request, response){

    var connection = database_connection();
    connection.query("SELECT * from users where phone_number='"+`${request.body.num}`+"' and password='"+`${request.body.pass}`+"'", function(err,data){
        if(err)
        console.log(err);

        connection.end();
        
        console.log(data[0]);
        if(typeof data[0]!=='undefined')
        {
            request.session.login=`${request.body.num}`;
            response.end("success");
        }
        else
        response.end("error");
    });
});
//Готово
app.post("/reg", urlencodedParser, function(request, response){

    var connection = database_connection();

    console.log(`INSERT INTO users VALUE(null,'${request.body.num}','${request.body.pass}')`);
    connection.query("SELECT phone_number from users where phone_number='"+`${request.body.num}`+"'", function(err,data){
        if(err)
        console.log(err);
        
        if(typeof data[0]=='undefined')
        {
            console.log("dads");
            connection.query(`INSERT INTO users VALUE(null,'${request.body.num}','${request.body.pass}')`, function(err,data1){

                connection.end();
                request.session.login=`${request.body.num}`;
                response.end("success");
            });     
        }
        else
        {
            connection.end();
            response.end("error");
        }
    });
});
//Готово
app.get("/search", urlencodedParser, function(request, response){

    var connection = database_connection();
    
    var where = `${request.query.qwety}`;
    where = where.split(' ');
    
    var query = '';

    for(let i=0; i<where.length;i++)
    {
        if(i!==where.length-1)
        query+= where[i]+"|";
        else
        query+= where[i];
    }

    connection.query("SELECT img, product_name, price, id_product from products WHERE product_name REGEXP '"+ query +"' or product_info REGEXP '"+ query +"'", function(err,data){
        if(err)
        console.log(err);

        connection.end();
        response.render("search", {find: `${request.query.qwety}`, products: data, sessionExist: request.session.login});
    });
    
});
//Готово
app.post("/addInBasket", urlencodedParser, function(request,response){

    if(typeof request.session.login=='undefined')
    {
        response.end("unlogin");
    }
    else
    {
        var connection = database_connection();
        connection.query(`SELECT * FROM basket a inner join users b on a.id_user=b.id_user WHERE id_product=${request.body.productid} and phone_number='`+request.session.login+`' and id_order is null`, function(err, data)
        {
            if(err)
            console.log(err);

            if(typeof data[0]=='undefined')
            {
                connection.query(`INSERT INTO basket SELECT null, id_user, null, ${request.body.productid}, ${request.body.quant} \
                FROM users WHERE phone_number='`+request.session.login+`'`, function(err,data){

                    if(err)
                    console.log(err);

                    console.log(data);
                    response.end("Новый");
                    connection.end()
                }
                );
            }
            else
            {
                var quan= data[0].quantity+parseInt(`${request.body.quant}`);

                connection.query(`UPDATE basket a inner join users b on a.id_user=b.id_user SET a.quantity=`+quan+` WHERE id_product=${request.body.productid} and phone_number='`+request.session.login+`' and id_order is null`, function(err,data){

                    connection.end();
                    response.end("Дополнен");
                });;
            }
        });
    }
});
//Готово
app.post("/removeFromBasket", urlencodedParser, function(request,response){

    var connection = database_connection();
    connection.query(`DELETE basket from basket RIGHT join users b on basket.id_user=b.id_user WHERE id_basket=${request.body.id} and b.phone_number='`+request.session.login+`'`, function(err,data){
        if(err)
        console.log(err);

        connection.end();
        response.end();
    })
});
//Готово
app.post("/makeAnOrder", urlencodedParser, function(request, response){

    var connection = database_connection();

    connection.query("SELECT a.id_basket, a.quantity, c.id_product, c.product_name,c.img,c.price FROM basket a INNER JOIN users b on a.id_user=b.id_user inner join products c on a.id_product=c.id_product where b.phone_number='"+request.session.login+"' and a.id_order is null", function(err, data){       
        if(err)
        console.log(err)

        var summ=0;

        data.forEach(element =>{
            summ+=parseInt(element.price)*parseInt(element.quantity);
        })

        connection.query("INSERT INTO orders SELECT null, id_user, NOW(), SUBDATE(now(), INTERVAL 1 day),"+ summ +" from users where phone_number='"+ request.session.login+"';", function(err,data){

            if(err)
            console.log(err);

            connection.query("SELECT id_order FROM orders a inner join users b on a.id_user=b.id_user WHERE NOT EXISTS (SELECT id_order from basket where id_order=a.id_order) and phone_number='"+request.session.login+"' LIMIT 1", function(err,data){

                if(err)
                console.log(err);

                console.log(data[0].id_order);

                connection.query("UPDATE basket a inner join users b on a.id_user=b.id_user SET id_order="+data[0].id_order+" WHERE phone_number='"+ request.session.login+"' and id_order is null", function(err,data){
                    if(err)
                    console.log(err);
                    
                    connection.end();
                    response.end();
                })
            });
        });
    }); 
});
//Готово
app.use(function(req, res, next) {
    res.status(404).render("404");
    
});

app.listen(3000);