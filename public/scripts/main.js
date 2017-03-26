$(function(){
    let table = $('table')
    const fields = ['title', 'solution', 'rate']
    const fieldsTitle = ['Проблема', 'Решение', 'Рейтинг']
    
    let helpers = {
        getRights:function(callback){
            $.get('/check_rights', function(data) {
                callback(null, data)
            })
            .fail(function(err) {
                callback(err, null)
            })
        },
        
        newTicket:function(){
            $.post('/new_ticket', {reason:0}, function(data) {
                helpers.addRow({'title':'', 'solution':'', 'rate':0, 'id':data.id})
            })
            .fail(function(err) {
                alert('У вас нет возможности создавать тикеты')
            })
        },
        
        addRow:function(ticket){
            let tr = $('<tr>', {
                'data-id':ticket.id
            })
            
            fields.forEach(function(field){
                if(field == 'rate'){
                    let starElement = $('<td>', {
                        id:field,
                        class:'c-rating'
                    })
                    tr.append(starElement)
                    helpers.showStar(starElement[0], ticket.id, ticket[field])
                } else {
                    let td = $('<td>', {
                        id:field
                    })
                    td.append($('<div>', {
                        id:'edit',
                        text: ticket[field]
                    }))
                    td.append($('<span>', {
                        class:'edit'
                    }))
                    tr.append(td)
                }
            })
            
            $(table).children().append(tr)
        },
        
        getTickets:function(callback){
            $.get('/tickets', function(data) {
                callback(null, data)
            })
            .fail(function(err) {
                callback(err, null)
            })
        },
        
        fillTable:function(table, data){
            $(table).children().empty()
            
            let head = $('<tr>')
            fieldsTitle.forEach(function(title){
                head.append($('<th>', { text: title }))
            })
            
            $(table).children().append(head)
            
            data.forEach(function(ticket){
                helpers.addRow(ticket)
            })
        },
        
        showStar:function(star, id, rate){
            var myRating = rating(star, rate, 5, function(rating){
                helpers.setRating(rating, id)
            })
        },
        
        setRating:function(rating, id){
            $.post('/update_ticket', {ticket:id, val:rating, reason:3}, function(data) {
                console.info('Оценка выставлена', data)
            })
            .fail(function(err) {
                alert('У вас нет возможности ставить оценки')
            })
        },
        
        updateText:function(val, id, reason){
            $.post('/update_ticket', {ticket:id, val:val, reason:reason}, function(data) {
                console.info('Текст изменён', data)
            })
            .fail(function(err) {
                alert('У вас нет возможности изменять текст')
            })
        },
        
        checkRights:function(err, data){
            if(err) throw err
            if(data.permissions == 1){
                helpers.getTickets(function(err, tickets){
                    if(err) throw err
                        helpers.fillTable(table, tickets)
                        $('.login').hide()
                        $('.tickets').show()
                        $('.logout').show()
                        $('.plus').show()
                })
            } else if(data.permissions == 2) {
                helpers.getTickets(function(err, tickets){
                    if(err) throw err
                        helpers.fillTable(table, tickets)
                        $('.login').hide()
                        $('.tickets').show()
                        $('.edit').hide()
                        $('.logout').show()
                })
            } else {
                $('.login').show()
                $('.tickets').hide()
                $('.logout').hide()
            }
        }
    }
    
    helpers.getRights(function(err, data){
        helpers.checkRights(err, data)
    })
    
    $('.loginForm').on('click', '#enter', function(){
        $.post('/login', {name:$('#name').val(), password:$('#password').val()}, function(data){
            helpers.checkRights(null, data)
        })
        .fail(function(){
            $('.notifData').empty().append('Ошибка! Данные введены неправильно')
        })
    })
    
    $('.tickets').on('click', '.plus', function(){
        helpers.newTicket()
    })

    $('.tickets').on('click', '.edit', function(){
        if($(this).hasClass('active')){
            $(this).removeClass('active')
            
            let ticket = $(this).parent().parent().data('id')
            let field  = $(this).parent().attr('id')
            let textElement = $(this).parent().children('#edit')
            
            let div = $('<div>', {
                type : 'text',
                id   :'edit',
                text: textElement.val()
            })
            
            textElement.replaceWith(div)
            
            helpers.updateText(textElement.val(), ticket, field == 'title' ? 1 : 2)
        } else {
            $(this).addClass('active')
            
            let ticket = $(this).parent().parent().data('id')
            let field  = $(this).parent().attr('id')
            let textElement = $(this).parent().children('#edit')
            
            let input = $('<input>', {
                type : 'text',
                id   :'edit',
                value: textElement.text()
            })
            
            textElement.replaceWith(input)
        }
    })
    
    $('body').on('click', '.logout', function(){
        $.get('/logout', function(data){
            helpers.checkRights(null, data)
        })
    })
    
})