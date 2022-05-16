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
