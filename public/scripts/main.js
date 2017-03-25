$(function(){
    let table = $("table")
    const fields = ["title", "solution", "rate"]
    
    let helpers = {
        getRights:function(callback){
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
                        helpers.showStar(starElement[0], ticket.id, ticket[field])
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
        
        showStar:function(star, id, rate){
            var myRating = rating(star, rate, 5, function(rating){
                helpers.setRating(rating, id)
            })
        },
        
        setRating:function(rating, id){
            $.post("/update_ticket", {ticket:id, val:rating, reason:3}, function(data) {
                console.info("Оценка выставлена", data)
            })
            .fail(function(err) {
                alert("У вас нет возможности ставить оценки")
            })
        },
        
        checkRights:function(err, data){
            if(err) throw err
            if(data.permissions == 1){
                helpers.getTickets(function(err, tickets){
                    if(err) throw err
                        helpers.fillTable(table, tickets)
                        $(".login").hide()
                        $(".tickets").show()
                        $(".logout").show()
                        $(".plus").show()
                })
            } else if(data.permissions == 2) {
                helpers.getTickets(function(err, tickets){
                    if(err) throw err
                        helpers.fillTable(table, tickets)
                        $(".login").hide()
                        $(".tickets").show()
                        $(".logout").show()
                })
            } else {
                $(".login").show()
                $(".tickets").hide()
                $(".logout").hide()
            }
        }
    }
    
    helpers.getRights(function(err, data){
        helpers.checkRights(err, data)
    })
    
    $(".loginForm").on('click', '#enter', function(){
        $.post("/login", {name:$("#name").val(), password:$("#password").val()}, function(data){
            helpers.checkRights(null, data)
        })
        .fail(function(){
            $(".notifData").empty().append("Ошибка! Данные введены неправильно")
        })
    })
    
    $("body").on("click", ".logout", function(){
        $.get("/logout", function(data){
            helpers.checkRights(null, data)
        })
    })
})