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