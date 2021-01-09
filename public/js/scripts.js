$(document).ready(function(){

    $("#logbtn").on('click', function(){

        if($("#num").val()!=="" && $("#pass").val()!=="")
        {
            $.ajax({
                url:"/log",
                method: "POST",
                data: {num: $("#num").val(),
                pass: $("#pass").val()},
                success: function(ex)
                {
                    if(ex=="error")
                    $("#error").html("Указаны неверные данные!");
                    else
                    window.location.href='/profile';
                },
                error: function(){
                    alert("Jib,rf");
                }
            });
        }
        else
        {
            $("#error").html("Заполните поля!");
        }
    });

    $("#num").on('keypress keyup', function(){
        $("#num").val($("#num").val().replace(/\D/gi,''));
    });

    $("#regbtn").on('click', function(){

        if($("#num").val()!=="" && $("#pass").val()!=="" && $("#pass2").val()!=="")
        {
            if($("#num").val().length==11)
            if($("#pass").val()==$("#pass2").val())
            $.ajax({
                url:"/reg",
                method: "POST",
                data: {num: $("#num").val(),
                pass: $("#pass").val()},
                success: function(ex)
                {
                    if(ex=="error")
                    $("#error").html("Пользователь уже существует!");
                    else
                    window.location.href='/profile';
                },
                error: function(){
                    
                }
            });
            else
            $("#error").html("Пароли не совпадают!");
            else
            $("#error").html("Неккоректный номер телефона!");
        }
        else
        {
            $("#error").html("Заполните все поля!");
        }
    });

    $("#minus").on('click', function(){
    
        $("#quantity").val(parseInt($("#quantity").val())-1);
        if($("#quantity").val()==0)
        {
        $("#minus").prop('disabled', true);
        $("#addin").prop('disabled', true);
        $("#addin").attr('id', 'off');
        }
        else
        {
        $("#addin").prop('disabled', false);
        $("#off").attr('id', 'addin');
        }

        $("#summarize").html( parseInt($("#pr-show").html())*parseInt($("#quantity").val()));
    });

    $("#plus").on('click', function(){
    
        $("#quantity").val(parseInt($("#quantity").val())+1);
        if($("#quantity").val()==0)
        {
        $("#minus").prop('disabled', true);
        $("#addin").prop('disabled', true);
        }
        else
        {
            $("#off").attr('id', 'addin');
        $("#minus").prop('disabled', false);
        $("#addin").prop('disabled', false);
        }

        $("#summarize").html(parseInt($("#pr-show").html())*parseInt($("#quantity").val()));
    });

    $("#quantity").on('keyup keydown', function(){
        $("#quantity").val($("#quantity").val().replace(/\D/gi,''));
        $("#summarize").html(parseInt($("#pr-show").html())*parseInt($("#quantity").val()));
    });

    $("#addin").on('click', function(){

        var url = window.location.href.substr(21).replace(/\D/gi,'');
        
        $.ajax({
            url: "/addInBasket",
            method: "POST",
            data: {quant: $("#quantity").val(), productid: url},
            success: function(res){

                if(res=="Новый")
                alert("Товар добавлен в корзину");
                else if(res=="Дополнен")
                alert("Товар дополнен");
                else if(res=="unlogin")
                window.location.href="/log";
                
            },
            error: function(){

            }
        })
    });

    $(".delete").on('click', function(){

        $.ajax({
            url: "/removeFromBasket",
            method: "POST",
            data: {id: $(this).attr('id')},
            success: function()
            {
                window.location.reload();
            },
            error: function(){

            }
        });
    });

    $("#makeorder").on('click', function(){

        $.ajax({
            url: "/makeAnOrder",
            method: "post",
            success: function()
            {
                window.location.href='/profile';
            },
            error: function()
            {
                
            }

        })
    });
});