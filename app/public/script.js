function getUsers(){
    
    fetch('/api/users')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        
        console.log(data);
        
        return data.map(function(user) {
            
            var container = document.getElementById('userContainer');
            container.innerHTML += `<a href="/ui/users/${user._id}">${user.name}</a><br>`;
        })
    })
    .catch( error => console.error(error) );
}

function getUser(){
    fetch('/api/users')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        
        console.log(data);
        
        return data.map(function(user) {
            
            var container = document.getElementById('userContainer');
            container.innerHTML += `<a href="/ui/users/${user._id}/profile">${user.name}</a><br>`;
        })
    })
    .catch( error => console.error(error) );
}

function login()
{
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var status;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then((resp) => resp.json())
    .then(function(data) {
        
        if(data.status == 200){                          
            document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC";
            console.log("cookie created")
        }
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

};
function insertBook(_url)
{
    //get the book title
    var _title = document.getElementsByName("title")[0].value;
    var _description = document.getElementsByName("description")[0].value;
    var _author = document.getElementsByName("author")[0].value;
    console.log(_title);

    var url = '../../api/books';
    var meth = 'POST';
    if(_url != null){
        url = url + _url;
        meth = 'PUT';
    }
    console.log(url);

    fetch(url, {
        method: meth,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { title: _title, description: _description, author: _author } ),
    })
    .then((resp) => {
        console.log(resp);
        if(_url != null)
            window.alert('Succesfully Edited');
        else
            window.alert('Succesfully Inserted');
        window.location.href = "../../ui/books";
        return;
    })
    .catch( error => console.error(error) );

};
function purgeBook(_url)
{
    //get the book title
    var url = "/api/books/"+_url;

    console.log(url);

    fetch(url, {
        method: 'DELETE',
    })
    .then((resp) => {
        console.log(resp);
        window.alert('Succesfully Deleted');
        window.location.href = "../../ui/books";
        return;
    })
    .catch( error => console.error(error) );
};
function reserveBook(_bookid)
{
    var userid = "6285fd041384bc896a7278e9";
    //get the book title
    var url = '../../api/users/'+userid+'/reservations';


    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { book: _bookid } ),
    })
    .then((resp) => {
        console.log(resp);
        window.alert('Succesfully Reserved');
        window.location.href = "../../ui/books";
        return;
    })
    .catch( error => console.error(error) );

};