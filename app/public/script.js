function getUsers(){
    
    fetch('/api/users')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please

        return data.map(function(user) {
            
            var container = document.getElementById('userContainer');
            container.innerHTML += `<a href="/ui/users/${user._id}">${user.name}</a><br>`;
        })
    })
    .catch( error => console.error(error) );
}

function getUser(userId){
    fetch('/api/users/'+userId)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        return data;
    })
    .catch( error => console.error(error) );
}

function login(email, password){
    var status;
    if(email == undefined || password == undefined){
        email = document.getElementById("email").value;
        password = document.getElementById("password").value;
        console.log('login')
    }

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {
        
        
        if(status == 200){                          
            setCookie("userCookie", { token: data.token, email: data.email, name: data.name, id: data.id})
            console.log("userCookie created")
            location.href = "/" 
        }
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

};

function insertBook(_url){
    //get the book title
    var _title = document.getElementsByName("title")[0].value;
    var _description = document.getElementsByName("description")[0].value;
    var _author = document.getElementsByName("author")[0].value;
    console.log(_title);

    var url = '../../api/books/';
    var meth = 'POST';
    if(_url != ""){
        url = url + _url;
        meth = 'PUT';
    }
    console.log(url);

    fetch(url+ "?token="+getCookie("userCookie").token , {
        method: meth,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { title: _title, description: _description, author: _author } ),
    })
    .then((resp) => {
        console.log(resp);
        if(resp.status==200){
            if(_url != "")
                window.alert('Succesfully Edited');
            else
                window.alert('Succesfully Inserted');
            window.location.href = "../../ui/books";
            return;
        }else{
            window.alert('Error '+resp.status); 
        }
    })
    .catch( error => console.error(error) );

};

function getBook(bookId, callback){
    fetch('/api/books/'+ bookId)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
        callback(data);
    })
    .catch( error => console.error(error) );
}

function getBooks(filtered){
    
    if(filtered)
        url = '/api/books?name=' + document.getElementById('filter').value;
    else
        url = '/api/books'
    
    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        
        var container = document.getElementById('bookContainer');
        container.innerHTML = ""
        
        return data.map(function(book) {
            container.innerHTML += `<a class='book' href="/ui/books/${book._id}"><p>${book.title}</p><br>${book.author}</a>`;
        })
    })
    .catch( error => console.error(error) );
}

function getCopies(){

    fetch("/api/copies")
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        
        var container = document.getElementById('copiesContainer');
        container.innerHTML = ""
        
        return data.map(function(copy) {
            getBook(copy.book, function(tmp){
                container.innerHTML += `<a href="/ui/copies/${copy._id}">${tmp.title}</a><br>`;
            });
        })
    })
    .catch( error => console.error(error) );
}

function purgeBook(_url){
    //get the book title
    var url = "/api/books/"+_url;

    console.log(url);

    fetch(url+ "?token="+getCookie("userCookie").token , {
        method: 'DELETE',
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            window.alert('Succesfully Deleted');
            window.location.href = "../../ui/books";
            return;
        }else{
            window.alert('Error '+resp.status); 
        }
    })
    .catch( error => console.error(error) );
};

function reserveBook(_bookid){
    var cookie = getCookie("userCookie");
    if(cookie == null) { alert("no"); return; }
    
    //get the book title
    console.log(cookie.id)
    var url = '../../api/users/'+ cookie.id +'/reservations';


    fetch(url + "?token=" + cookie.token , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { book: _bookid } ),
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            return;
        }else{
            window.alert('Error '+resp.status); 
        }
    })
    .catch( error => console.error(error) );

};

function signin(){
    var status;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {
        
        if(status == 200){    
            login(email, password)
            console.log('signin')
            location.href = "/"
        }
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
};

function logout(){
    var status;
    if(getCookie("userCookie") == null) return;

    fetch('/api/logout?token='+getCookie("userCookie").token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {
        
        if(status == 200)
            deleteCookie("userCookie")
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
    location.reload();
}

function getProfile() {
    
    var status;
    var id = getCookie("userCookie").id.toString();

    if (id == null) return;

    fetch('/api/users/'+ id + "?token="+getCookie("userCookie").token , {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then((resp) => {console.log(resp);status = resp.status; return resp.json() })
    .then(function(data) {
        
        if(status == 200){
            document.getElementById("profileInfo").innerHTML+="<p>"+ data.email +"</p><p>"+ data.name +"</p>";
        }
        getReservations();
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

function getReservations() {
    var status;
    var id = getCookie("userCookie").id.toString();

    if (id == null) return;

    fetch('/api/users/'+ id + "/reservations?token="+getCookie("userCookie").token , {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then((resp) => {console.log(resp);status = resp.status; return resp.json() })
    .then(function(data) {
        
        if(status == 200){
            console.log(data);
            for(var i = 0;i<data.length;i++){
                getBook(data[i].book, function(book){
                    document.getElementById("reservations").innerHTML+="<div class='reservationdiv'><p>"+ book.title +"</p></div>";
                })
            }
        }
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + 24*60*60*1000); //one day
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + JSON.stringify(cvalue) + ";" + expires + ";path=/";
}

function getCookie(cname) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(cname == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return JSON.parse(decodeURIComponent(cookiePair[1]));
        }
    }
    
    // Return null if not found
    return null;
}

function deleteCookie(cname){
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function setheader() {
    if(getCookie("userCookie") != null){
        document.getElementById("logindiv").style.display = "None";
    }else{
        document.getElementById("logoutdiv").style.display = "None";
    }
    if(false){                                                                  //TODO:condition to if not admin
        var items = document.getElementsByName("adminonly");
        for (var i = items.length - 1; i >= 0; i--) {
            items[i].style.display = "None";
        }
    }
}

function insertCopy(_url){
    //get the book title
    var _book = document.getElementsByName("book")[0].value;
    var _owner = document.getElementsByName("owner")[0].value;
    var _buyer = document.getElementsByName("buyer")[0].value;
    var _price = document.getElementsByName("price")[0].value;

    var url = '../../api/copies/'+_url;
    var meth = 'POST';
    if(_url != ""){
        url = url + _url;
        meth = 'PUT';
    }
    console.log(url);

    fetch(url+ "?token="+getCookie("userCookie").token , {
        method: meth,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { book: _book, owner: _owner, buyer: _buyer , price: _price } ),
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            if(_url != "")
                window.alert('Succesfully Edited');
            else
                window.alert('Succesfully Inserted');
            window.location.href = "../../ui/copies";
            return;
        }else{
            window.alert('Error '+resp.status); 
        }
    })
    .catch( error => console.error(error) );

};

function purgeCopy(_url){
    //get the book title
    var url = "/api/copies/"+_url;

    console.log(url);

    fetch(url+ "?token="+getCookie("userCookie").token , {
        method: 'DELETE',
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            window.alert('Succesfully Deleted');
            window.location.href = "../../ui/copies";
            return;
        }else{
            window.alert('Error '+resp.status); 
        }
    })
    .catch( error => console.error(error) );
};
