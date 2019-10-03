// built-in Node.js modules
var fs = require('fs');
var http = require('http');
var path = require('path');
var querystring = require('querystring');

var port = 8000;
var public_dir = path.join(__dirname, 'public');

var members;
//reading json file
var datapath = path.join(public_dir, 'data');
datapath = path.join(datapath, 'members.json');

fs.readFile(datapath, (err, data) => {
    if (err) {
        throw err;
    } else {
        members = data;
        members = members.toString();
    }
});

// function
function NewRequest(req, res) {
    
    var filename = req.url.substring(1);
    var contentType = { '.html' : 'text/html', '.css' : 'text/css', '.js' : 'text/javascript',
    '.jpg' : 'image/jpeg', '.png' : 'image/png', '.json' : 'application/json'};
    // handling POST and GET requests
    if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString(); // convert binary buffer to string
        });
        req.on('end', () => {
            //fname=Luca&lname=Comba&email=luca.comba98%40gmail.com&gender=Female&birthday=1999-01-01
            var uploaded = body.split('&');
            var name = uploaded[0].split('=');
            name = name[1];
            var lastname = uploaded[1].split('=');
            lastname = lastname[1];
            var email = uploaded[2].split('=');
            email = email[1].split('%40');
            email = email[0] + '@' + email[1];
            var gender = uploaded[3].split('=');
            gender = gender[1];
            if (gender == 'Female') {
                gender = 'F';
            } else if (gender == 'Male') {
                gender = 'M';
            } else {
                gender = 'O';
            }
            var birthday = uploaded[4].split('=');
            birthday = birthday[1];
            // writing members in members.json
            uploadedData = '{\n'+'    "' + email + '"' + ': ' + '{\n' + 
            '        "' + 'fname' + '"' + ': ' + '"' + name + '",\n' +
            '        "' + 'lname' + '"' + ': ' + '"' + lastname + '",\n' +
            '        "' + 'gender' + '"' + ': ' + '"' + gender + '",\n' +
            '        "' + 'birthday' + '"' + ': ' + '"' + birthday + '"\n' +
            '    },';
            members = members.replace('{',' ');
            members = uploadedData + members;
            fs.writeFile(datapath, members, (err) => {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write('Oh no! Could not write it!');
                    res.end();
                }
            });

            filename = 'join.html';
            var fullpath = path.join(public_dir, filename);
            
            fs.readFile(fullpath, (err, data) => {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write('Oh no! Could not find file');
                    res.end();
                } else {
                    res.writeHead(200, {'Content-Type': contentType[path.extname(fullpath)]});
                    res.write(data);
                    res.end();
                }
            });
        });
    } else if (req.method === 'GET') {
        if (filename === '') {
            filename = 'index.html';
        }
        var fullpath = path.join(public_dir, filename);
        fs.readFile(fullpath, (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Oh no! Could not find file');
                res.end();
            } else {
                res.writeHead(200, {'Content-Type': contentType[path.extname(fullpath)]});
                res.write(data);
                res.end();
            } 
        });
    }

    
}

var server = http.createServer(NewRequest);

console.log('Now listening on port ' + port);
server.listen(port, '0.0.0.0');
