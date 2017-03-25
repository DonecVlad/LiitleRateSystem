$(function(){
    let table = $("table")
    const fields = ["title", "solution", "rate"]




    let helpers = {
        
        checkRights:function(callback){
            $.get("/check_rights", function(data) {
                callback(null, data)
            })
            .fail(function(err) {
                callback(err, null)
            })
        },
        
        getTickets:function(callback){
            $.get("/tickets", function(data) {
                callback(null, data)
            })
            .fail(function(err) {
                callback(err, null)
            })
        },
        
        fillTable:function(table, data){
            data.forEach(function(ticket){
                let tr = $("<tr>", {
                    'data-id':ticket.id
                })
                
                fields.forEach(function(field){
                    if(field == "rate"){
                        let starElement = $("<td>", {
                            id:field,
                            class:"c-rating"
                        })
                        tr.append(starElement)
                        helpers.showStar(starElement[0], ticket[field])
                    } else {
                        tr.append($("<td>", {
                            text: ticket[field],
                            id:field
                        }))
                    }
                })
                
                $(table).children().append(tr)
            })
        },
        
        showStar:function(star, rate){
            var callback = function(rating) { alert(rating); };
            var myRating = rating(star, rate, 5, callback);
        }
    }


    
    helpers.checkRights(function(err, permissions){
        if(err) throw err
        if(permissions == 1){
            helpers.getTickets(function(err, tickets){
                if(err) throw err
                    helpers.fillTable(table, tickets)
                    $(".tickets").show()
            })
        } else if(permissions == 2) {
            helpers.getTickets(function(err, tickets){
                if(err) throw err
                    helpers.fillTable(table, tickets)
                    $(".tickets").show()
            })
        } else {
            $(".login").show();
        }
    })
    
    $(".loginForm").on('click', '#enter', function(){
        $.post("/login", {name:$("#name").val(), password:$("#password").val()}, function(){
            $(".login").hide()
            
            helpers.getTickets(function(err, tickets){
                if(err) throw err
                    helpers.fillTable(table, tickets)
                    $(".tickets").show()
            })
        })
        .fail(function(){
            $(".notifData").empty().append("Ошибка! Данные введены неправильно")
        })
    })
    

})