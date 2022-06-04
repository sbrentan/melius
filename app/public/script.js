function getUserStatus() {
    var cookie =getCookie("userCookie");
    console.log(cookie)
    if(cookie == null){
        console.log("non logged user")
        return;
    }
    else if(cookie.role == "admin"){
        showHiddenElements("hiddenAdminRole")
        showHiddenElements("hiddenUserRole")
        console.log("admin")
    }
    else{
        showHiddenElements("hiddenUserRole")
        console.log("logged user")
    }
}

function setheader() {
    
    getUserStatus();

    if(getCookie("userCookie") != null){
        document.getElementById("logindiv").style.display = "None";
        document.getElementById('signindiv').style.display = "None";
    }else{
        document.getElementById("logoutdiv").style.display = "None";
    }
}
function showHiddenElements(className){
    var elements = document.getElementsByClassName(className)
    const thingsArray = Array.from(elements)
    thingsArray.forEach(thing => thing.classList.remove(className))
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
            setCookie("userCookie", { token: data.token, email: data.email, name: data.name, id: data.id, role: data.role})
            console.log("userCookie created")
            location.href = "/"
        }
        else{
            alert("Credenziali errate")
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
        url = '/api/books';

    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please

        var container = document.getElementById("bookContainer");
        container.innerHTML = ""

        return data.map(function(book) {
            container.innerHTML += `<a class='book' href="/ui/books/${book._id}"><p>${book.title}</p><br>${book.author}</a>`;
        })
    })
    .catch( error => console.error(error) );
}

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
            alert("Libro prenotato")
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
            console.log('signin')
            login(email, password)
            alert("Utente creato")
        }
        else{
            alert("Utente già esistente")
        }
        return;
    })
    .catch( error => console.error(error)); // If there is any error you will catch them here
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

        if(status == 200){
            deleteCookie("userCookie")
            location.href = "/ui/login";
        }
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

function getProfile(reservations) {

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
            if(reservations){
                document.getElementById("email").innerText = data.email;
                document.getElementById("name").innerText = data.name;
            }
            else{
                document.getElementById("email").value = data.email;
                document.getElementById("name").value = data.name;
            }
        }
        if(!reservations)
            return;
            
        getReservations();
    })
    .catch( error => console.log(status));//console.error(error) ); // If there is any error you will catch them here
}

function getReservations() {
    var status,dataRes;
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
                dataRes = data[i];
                getBook(data[i].book, function(book){
                    console.log(book.title)
                    document.getElementById("reservations").innerHTML+="<div class='reservationdiv'><p style='display: inline;'>"+ book.title +"</p><button class='delete' style='display: inline; border-radius: 5px' type='button' onclick=deleteReservation('"+ dataRes._id + "','" + book.title.replaceAll(" ", "%20") +"')>elimina prenotazione</button></div>";
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

function insertCopy(copyId){

    var book = document.getElementById("book").value;
    var owner = document.getElementById("owner").value;
    var price = document.getElementById("price").value;

    //new copy
    if(copyId ==""){
        fetch("/api/copies/?token="+getCookie("userCookie").token , {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book: book, owner: owner, price: price})
        })
        .then((resp) => {
            if(resp.status==200){
                console.log(resp);
                window.alert('Succesfully Edited');
                return;
            }else{
                window.alert('Error '+resp.status);
            }
        })
        .catch( error => console.error(error) );
        return;
    }

    console.log(copyId, book, owner, price);
    
    fetch("/api/copies/" + copyId + "?token="+getCookie("userCookie").token , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: book, owner: owner, price: price})
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            window.alert('Succesfully Edited');
            return;
        }else{
            window.alert('Error '+resp.status);
        }
    })
    .catch( error => console.error(error) );
    
};

function purgeCopy(copyId){


    fetch("/api/copies/" + copyId + "?token="+getCookie("userCookie").token , {
        method: 'DELETE',
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            window.alert('Succesfully Deleted');
            return;
        }else{
            window.alert('Error '+resp.status);
        }
    })
    .catch( error => console.error(error) );
};

function changePassword(){
    var oldPassword = document.getElementById("oldPassword").value;
    var newPassword = document.getElementById("newPassword").value;
    var id = getCookie("userCookie").id.toString();

    if(oldPassword == "" || newPassword == ""){
        
        alert("password errate");
        return;
    }

    if (id == null) return;

    fetch('/api/users/'+ id + "/check?token="+getCookie("userCookie").token , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: oldPassword})
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {

        if(!data.correct){
            alert("Vecchia password errata");
            return;
        }

        fetch('/api/users/'+ id + "?token="+getCookie("userCookie").token , {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword})
        })
        .then((resp) => {
    
    
            if(resp.status == 200){
                alert("password modificata correttamente")
                location.href = ''
            }
            else{
                alert("Credenziali errate")
            }
    
            return;
        })
        .catch( error => console.error(error) );
    })
    
}

function askInfo(){
    var status;

    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var email = document.getElementById("email").value;
    var subject = document.getElementById("subject").value;

    if(name == "" || surname == "" || email == "" || subject == ""){
        alert("Errore! compila tutti i campi");
        return;
    }

    fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, surname: surname, email: email, subject: subject })
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {

        if(status == 200){
            alert("Messaggio inviato correttamente")
            location.href = "/";
        }else{
            alert("Errore: messaggio non inviato")
        }
        return;
    })
    .catch( error => console.error(error) );
}

function dashboardselected(selection) {
    switch(selection){
        case 0:
            document.getElementById("usercontainer").classList.remove("closed");
            document.getElementById("bookcontainer").classList.add("closed");
            document.getElementById("copycontainer").classList.add("closed");
            getUsers("userlist");
            break;  
        case 1:
            document.getElementById("usercontainer").classList.add("closed");
            document.getElementById("bookcontainer").classList.remove("closed");
            document.getElementById("copycontainer").classList.add("closed");
            getBooksDashboard("booklist");
            break;  
        case 2:
            document.getElementById("usercontainer").classList.add("closed");
            document.getElementById("bookcontainer").classList.add("closed");
            document.getElementById("copycontainer").classList.remove("closed");
            getCopies("copylist");
            break;  
    }
}

function getUsers(containerName){

    var cookie = getCookie("userCookie");

    if (cookie.id == null) return;

    fetch('/api/users?token=' + cookie.token)
    .then((resp) => resp.json())
    .then(function(data) {

        var container = document.getElementById(containerName);
        container.innerHTML = "";

        return data.map(function(user) {
            container.innerHTML += `<a class='item' href="/ui/users/${user._id}">${user.name}</a><br>`;
        })
    })
    .catch( error => console.error(error) );
}

function fillUserEdit(userId){

    var cookie = getCookie("userCookie");

    if (cookie.id == null) return;

    fetch('/api/users/'+userId+"?token=" + cookie.token)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        var name = document.getElementById("name");
        var email = document.getElementById("email");
        console.log(data);
        name.value = data.name;
        email.value = data.email;
    })
    .catch( error => console.error(error) );
}

function updateUser(userId){
    var new_name = document.getElementById("name").value;
    var new_email = document.getElementById("email").value;
    
    var cookie = getCookie("userCookie");

    if(new_name == "" || new_email == ""){   
        alert("Campi inseriti non corretti");
        return;
    }

    if (cookie == null) return;

    fetch('/api/users/'+ userId + "?token=" + cookie.token , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: new_name, email: new_email})
    })
    .then((resp) => {
    
        if(resp.status == 200){
            alert("Campi modificati correttamente")
            location.reload();
        }
        else{
            alert("Campi non modificati")
        }

        return;
    })
    .catch( error => console.error(error) );
}

function purgeUser(userId){
    var url = "/api/users/"+userId;

    console.log(userId);
    var cookie = getCookie("userCookie");

    if(cookie == null) return;

    fetch(url+ "?token=" + cookie.token , {
        method: 'DELETE',
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            alert('Utente eliminato con successo');
            location.href = "/ui/dashboard";
            return;
        }else{
            alert("Libro non eliminato");
        }
    })
    .catch( error => console.error(error) );
}

function getBooksDashboard(containerName){

    url = '/api/books';

    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please

        var container = document.getElementById(containerName);
        container.innerHTML = "";

        return data.map(function(book) {
            container.innerHTML += `<a class='item' href="/ui/books/edit/${book._id}">${book.title}</a><br>`;
        })
    })
    .catch( error => console.error(error) );
}

function fillBook(bookId){

    fetch('/api/books/'+bookId)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        var title = document.getElementById("title");
        var description = document.getElementById("description");
        var author = document.getElementById("author");

        title.value = data.title;
        description.value = data.description;
        author.value = data.author;
    })
    .catch( error => console.error(error) );
}

function updateBook(bookId){
    var new_title = document.getElementById("title").value;
    var new_description = document.getElementById("description").value;
    var new_author = document.getElementById("author").value;

    var cookie = getCookie("userCookie");

    if(new_title == "" || new_description == "" || new_author == ""){   
        alert("Campi inseriti non corretti");
        return;
    }

    if (cookie == null) return;

    fetch('/api/books/'+ bookId + "?token=" + cookie.token , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: new_title, description: new_description, author: new_author})
    })
    .then((resp) => {
    
        if(resp.status == 200){
            alert("Campi modificati correttamente")
            location.reload();
        }
        else{
            alert("Campi non modificati")
        }

        return;
    })
    .catch( error => console.error(error) );
}

function purgeBook(_url){
    //get the book title
    var url = "/api/books/"+_url;

    var cookie = getCookie("userCookie");

    if(cookie == null) return;

    fetch(url+ "?token=" + cookie.token , {
        method: 'DELETE',
    })
    .then((resp) => {
        if(resp.status==200){
            alert('Libro eliminato correttamente');
            location.href = "/ui/dashboard";
        }else{
            alert("Libro non eliminato")
        }

        return;
    })
    .catch( error => console.error(error) );
};

function getCopies(containerName){

    fetch("/api/copies")
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please

        var container = document.getElementById(containerName);
        container.innerHTML = ""

        return data.map(function(copy) {
            getBook(copy.book, function(tmp){
                container.innerHTML += `<a class='item' href="/ui/copies/${copy._id}">${tmp.title}</a><br>`;
            });
        })
    })
    .catch( error => console.error(error) );
}

function fillCopyEdit(copyId){

    fetch('/api/copies/'+copyId)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        var book = document.getElementById("book");
        var owner = document.getElementById("owner");
        var buyer = document.getElementById("buyer");
        var price = document.getElementById("price");

        book.value = data.book;
        owner.value = data.owner;
        buyer.value = data.buyer;
        price.value = data.price;
    })
    .catch( error => console.error(error) );
}

function editProfile() {
    var cookie = getCookie("userCookie");
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var id = cookie.id.toString();

    if (id == null) return;

    if(email == "" || name == ""){
        
        alert("dati non inseriti correttamente");
        return;
    }
    else{
        fetch('/api/users/'+ id + "?token="+getCookie("userCookie").token , {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name,email: email})
        })
        .then((resp) => {
    
    
            if(resp.status == 200){
                alert("dati modificati correttamente")
                location.href = ''
            }
            else{
                alert("errore nella modifica dei dati")
            }
    
            return;
        })
        .catch( error => console.error(error) );
    }   
}

function deleteReservation(resId,bookTitle) {

    var id =  getCookie("userCookie").id.toString();

    if (id == null) return;

    if(!confirm("Vuoi davvero eliminare la prenotazione per '"+ bookTitle.replaceAll("%20", " ") +"'"))
        return;

    fetch('/api/users/'+ id + "/reservations/" + resId + "?token="+getCookie("userCookie").token , {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
        if(data.status == 200){
            alert("prenotazione eliminata correttamente")
            location.href = ''
        }
        else{
            alert("errore nell'eliminazione")
        }

        return;
        
    }).catch( error => console.error(error) );   
}   

function getCopyDetails(copyId){

    // new copy
    if (copyId == "false"){
        fetch("/api/books/?token="+getCookie("userCookie").token , {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then((resp) => resp.json())
        .then(function(data) {
            console.log(data)
            data.forEach(book => {
                document.getElementById("book").innerHTML += "<option value='"+ book._id +"'> "+ book.title +" </option>";
            });
            
        })
        .catch( error => console.error(error) );
        return;
    }
        

    fetch('/api/copies/'+ copyId + "?token="+getCookie("userCookie").token , {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then((resp) => resp.json())
    .then(function(data) {
        console.log(data)

        document.getElementById("owner").value = data.owner
        document.getElementById("buyer").value = data.buyer
        document.getElementById("price").value = data.price
        
        fetch('/api/books/'+ data.book + "?token="+getCookie("userCookie").token , {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then((resp) => resp.json())
        .then(function(data) {
            console.log(data)
            document.getElementById("book").innerHTML += "<option value='"+ data._id +"'> "+ data.title +" </option>";
            
        })
        .catch( error => console.error(error) );
    })
    .catch( error => console.error(error) );
}