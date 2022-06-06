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
        document.getElementById
        showHiddenElements("hiddenUserRole")
        console.log("logged user")
    }
}

function setheader() {
    
    getUserStatus();
    var cookie =getCookie("userCookie");

    if(cookie != null){
        document.getElementById("logindiv").style.display = "None";
        document.getElementById('signindiv').style.display = "None";
    }else{
        document.getElementById("logoutdiv").style.display = "None";
    }
    if(cookie.role != "admin"){
        document.getElementById("header").classList.add("userheader");
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

function getBook(bookId, callback){
    fetch('/api/books/'+ bookId)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
        if(data.status!=500){
            callback(data);
        }else{
            alert("Errore");
        }
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
        if(data.status!=500){
            var container = document.getElementById("bookContainer");
            container.innerHTML = ""

            return data.map(function(book) {
                container.innerHTML += `<a class='book' href="/ui/books/${book._id}"><p>${book.title}</p>${book.author}</a>`;
            })
        }else{
            alert("Errore");
        }
    })
    .catch( error => console.error(error) );
}

function reserveBook(_bookid){
    var cookie = getCookie("userCookie");
    if(cookie == null) { alert("no"); return; }

    //get the book title
    console.log(cookie.id)
    var url = '/api/users/'+ cookie.id +'/reservations';


    fetch(url + "?token=" + cookie.token , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { book: _bookid } ),
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            alert("Libro prenotato")
            location.href = ""
            return;
        }else{
            window.alert('Libro non disponibile');
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
        }else{
            alert("Errore");
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
            
        getReservations(false);
    })
    .catch( error => console.log(status));//console.error(error) ); // If there is any error you will catch them here
}

async function getReservations(adminPage) {
    var status,dataRes,modalName,btnName,reservationId,bookTitle,bookId;
    var resIds = []

    var id = getCookie("userCookie").id.toString();

    if (id == null) return;

    fetch('/api/users/'+ id + "/reservations?token="+getCookie("userCookie").token , {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then((resp) => {console.log(resp);status = resp.status; return resp.json() })
    .then(async function(data) {

        if(status == 200){
            console.log(data);
            for(var i = 0;i<data.length;i++){
                reservationId = data[i]._id
                console.log(i)

                data_book = await fetch('/api/books/'+ data[i].book)
                .then((resp) => resp.json()) // Transform the data into json
                .catch( error => console.error(error) );

                bookTitle = data_book.title
                bookId = data_book._id

                if (adminPage) {
                    btnName = "btn"+reservationId;
                    modalName = "modal"+reservationId;

                    document.getElementById("modals").innerHTML+=`<div id=\"` + modalName + `\" class="modal">

                    <div class="modal-content">
                        <span id='close` + reservationId + `' class="close">&times;</span>
                        <select id="select` + reservationId + `"></select>
                        <button id="confermAccept` + reservationId + `" class="button" type="button" onclick="acceptReservation('` + reservationId +`')">accetta</button>
                    </div>
                    
                    </div>`;

                    document.getElementById("reservations").innerHTML+="<div class='reservationdiv'><p style='display: inline;'>"+ bookTitle +"<button id='' class='delete' style='display: inline; border-radius: 5px' type='button' onclick=deleteReservation('"+ reservationId + "','" + bookTitle.replaceAll(" ", "%20") +"')>elimina</button><button class='button' id='" + btnName + "' style='display: inline; border-radius: 5px' type='button'>accetta</button></p></div>";   
                    
                    resIds.push({reservationId,bookId})
                }
                else{
                    document.getElementById("reservations").innerHTML+="<div class='reservationdiv'><p style='display: inline;'>"+ bookTitle +"</p><button class='delete' style='display: inline; border-radius: 5px' type='button' onclick=deleteReservation('"+ reservationId + "','" + bookTitle.replaceAll(" ", "%20") +"')>elimina prenotazione</button></div>";
                }
            }
            if (adminPage) {
                for (let i = 0; i < resIds.length; i++) {
                    document.getElementById("btn"+resIds[i]['reservationId']).onclick = function() {
                        document.getElementById("modal"+resIds[i]['reservationId']).style.display = "block";
    
                        fetch("/api/copies?book=" + resIds[i]['bookId'] + "&?token="+getCookie("userCookie").token)
                        .then((resp) => resp.json())
                        .then(function(data) {
                            data.forEach(copy => {
                                document.getElementById("select"+resIds[i]['reservationId']).innerHTML += "<option value='"+ copy._id + "'> ID: " + copy.id +" [" + copy.price + " €]</option>";
                            });
                        })
                        .catch( error => console.error(error) );
                    }
    
                    document.getElementById('close'+resIds[i]['reservationId']).onclick = function() {
                        document.getElementById("modal"+resIds[i]['reservationId']).style.display = "none";
                    }
                    
                }
            }
        }
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

function acceptReservation(reservationId) {
    var status;
    var cookie = getCookie("userCookie")

    var copyId = document.getElementById("select"+reservationId).value

    fetch('/api/users/' + cookie.id + "/reservations/" + reservationId + "?token="+ cookie.token , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copy: copyId})
    })
    .then((resp) => {console.log(resp);status = resp.status; return resp.json() })
    .then(function(data) {

        if(status == 200){
            location.href = "";
        }
    })
    .catch( error => console.log(status));
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
    location.hash = "#"+selection;
    switch(selection){
        case 0:
            document.getElementById("usercontainer").classList.remove("closed");
            document.getElementById("bookdashcontainer").classList.add("closed");
            document.getElementById("copycontainer").classList.add("closed");
            getUsers("userlist");
            break;  
        case 1:
            document.getElementById("usercontainer").classList.add("closed");
            document.getElementById("bookdashcontainer").classList.remove("closed");
            document.getElementById("copycontainer").classList.add("closed");
            getBooksDashboard("booklist");
            break;  
        case 2:
            document.getElementById("usercontainer").classList.add("closed");
            document.getElementById("bookdashcontainer").classList.add("closed");
            document.getElementById("copycontainer").classList.remove("closed");
            getCopies("copylist");
            break;  
    }
}

function getUsers(containerName,userId){

    var cookie = getCookie("userCookie");

    if (cookie.id == null) return;

    fetch('/api/users?token=' + cookie.token)
    .then((resp) => resp.json())
    .then(function(data) {
        if(containerName == "copies"){
            console.log(data)
            data.forEach(user => {
                if(userId == user._id)
                    document.getElementById("owner").innerHTML += "<option id='"+ user._id +"' value='"+ user._id +"' selected> "+ user.name +" </option>";
                else
                    document.getElementById("owner").innerHTML += "<option id='"+ user._id +"' value='"+ user._id +"'> "+ user.name +" </option>";
            });

            return;
        }

        var container = document.getElementById(containerName);
        container.innerHTML = "";

        return data.map(function(user) {
            container.innerHTML += `<a class='item' href="/ui/users/${user._id}">${user.name}</a>`;
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

    getReservations(true);
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
            alert("Campi modificati correttamente");
            window.location.href="/ui/dashboard#0";
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

    if(cookie == null) return; if(!confirm("Vuoi davvero eliminare l'utente"))
    return; fetch(url+ "?token=" + cookie.token , { method: 'DELETE', })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            alert('Utente eliminato con successo');
            location.href = "/ui/dashboard#0";
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
            container.innerHTML += `<a class='item' href="/ui/books/edit/${book._id}">${book.title}</a>`;
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
        var availability = document.getElementById("availability");
        var price = document.getElementById("price");
        if(data.status==500){
            document.title="Nuovo libro";
            document.getElementById("divtitle").innerHTML="Nuovo libro";
            document.getElementById("confbutton").innerHTML="Crea";
        }else{
            title.value = data.title;
            description.value = data.description;
            author.value = data.author;
            availability.value = data.availability;
            if(data.availability == 0 || data.availability<0)
                price.value = "-"
            else
                price.value = data.starting_price;
        }
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
    if(bookId =="false"){
        fetch("/api/books/?token="+getCookie("userCookie").token , {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: new_title, description: new_description, author: new_author})
        })
        .then((resp) => {
            if(resp.status==200){
                console.log(resp);
                window.alert('Libro creato correttamente');
                window.location.href="/ui/dashboard#1";
                return;
            }else{
                window.alert('Errore! Libro non creato');
            }
        })
        .catch( error => console.error(error) );
        return;
    }
    else {
        fetch('/api/books/'+ bookId + "?token=" + cookie.token , {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: new_title, description: new_description, author: new_author})
        })
        .then((resp) => {
        
            if(resp.status == 200){
                alert("Campi modificati correttamente")
                window.location.href="/ui/dashboard#1";
            }
            else{
                alert("Errore! Campi non modificati")
            }

            return;
        })
        .catch( error => console.error(error) );
    }
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
            location.href = "/ui/dashboard#1";
        }else{
            alert("Errore! Libro non eliminato")
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
                container.innerHTML += `<a class='item' href="/ui/copies/${copy._id}">${tmp.title}</a>`;
            });
        })
    })
    .catch( error => console.error(error) );
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
            data.forEach(book => {
                document.getElementById("book").innerHTML += "<option value='"+ book._id +"'> "+ book.title +" </option>";
            });
            document.title="Nuova Copia";
            document.getElementById("divtitle").innerHTML="Nuova Copia";
            document.getElementById("confbutton").innerHTML="Crea";
            getUsers("copies");
            
        })
        .catch( error => console.error(error) );
        return;
    }
        
    var ownerId;
    //modify
    fetch('/api/copies/'+ copyId + "?token="+getCookie("userCookie").token , {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then((resp) => resp.json())
    .then(function(data) {
        ownerId = data.owner
        document.getElementById("price").value = data.price
        
        fetch('/api/books/'+ data.book + "?token="+getCookie("userCookie").token , {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then((resp) => resp.json())
        .then(function(data) {
            document.getElementById("book").innerHTML += "<option value='"+ data._id +"'> "+ data.title +" </option>";
            getUsers("copies",ownerId);
            console.log(ownerId)
            document.getElementById("owner").value = ownerId;
        })
        .catch( error => console.error(error) );
    })
    .catch( error => console.error(error) );
}

function insertCopy(copyId){

    var book = document.getElementById("book").value;
    var owner = document.getElementById("owner").value;
    var price = document.getElementById("price").value;

    //new copy
    if(copyId =="false"){
        fetch("/api/copies/?token="+getCookie("userCookie").token , {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book: book, owner: owner, price: price})
        })
        .then((resp) => {
            if(resp.status==200){
                console.log(resp);
                window.alert('Copia creata correttamente');
                window.location.href="/ui/dashboard#2";
                return;
            }else{
                window.alert('Errore! Copia non inserita ');
            }
        })
        .catch( error => console.error(error) );
        return;
    }
    else {

        fetch("/api/copies/" + copyId + "?token="+getCookie("userCookie").token , {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book: book, owner: owner, price: price})
        })
        .then((resp) => {
            if(resp.status==200){
                console.log(resp);
                window.alert('Copia modificata correttamente');
                window.location.href="/ui/dashboard#2";
                return;
            }else{
                window.alert('Errore! Copia non modificata');
            }
        })
        .catch( error => console.error(error) );
    }
    
};

function purgeCopy(copyId){


    fetch("/api/copies/" + copyId + "?token="+getCookie("userCookie").token , {
        method: 'DELETE',
    })
    .then((resp) => {
        if(resp.status==200){
            console.log(resp);
            window.alert('Copia eliminata correttamente');
            location.href = "/ui/dashboard#2"
        }else{
            window.alert('Errore! Copia eliminata');
        }
    })
    .catch( error => console.error(error) );
};

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
function dashboardautoselect() {
   if(isNaN(location.hash.charAt(1))){
        dashboardselected(0);
    }else{
        dashboardselected(parseInt(location.hash.charAt(1)));
    }
}