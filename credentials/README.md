# Credentials Folder

## The purpose of this folder is to store all credentials needed to log into your server and databases. This is important for many reasons. But the two most important reasons is
    1. Grading , servers and databases will be logged into to check code and functionality of application. Not changes will be unless directed and coordinated with the team.
    2. Help. If a class TA or class CTO needs to help a team with an issue, this folder will help facilitate this giving the TA or CTO all needed info AND instructions for logging into your team's server. 


# Below is a list of items required. Missing items will causes points to be deducted from multiple milestone submissions.

1. Server URL or IP: 18.117.162.109
2. SSH username: ubuntu
3. SSH password or key. (Team8Key.pem)
    <br> If a ssh key is used please upload the key to the credentials folder.
4. Database URL or IP and port used. (http://18.117.162.109)
    <br><strong> NOTE THIS DOES NOT MEAN YOUR DATABASE NEEDS A PUBLIC FACING PORT.</strong> But knowing the IP and port number will help with SSH tunneling into the database. The default port is more than sufficient for this class.
5. Database username: kurt
6. Database password: Kurteekurt123!
7. Database name (basically the name that contains all your tables): team8db
8. Instructions on how to use the above information.
- Before doing ssh, make sure you've granted permission for the key Team8Key. In order to do that, do ```chmod 400 Team8Key.pem```.
- Once done, ssh using ```ssh -i Team8Key.pem ubuntu@3.148.186.153```.
- Navigate to ```/projects/csc648-fa25-0104-team08/application```.
- Load the server with Node ```node app.js```.
- Use ```http://3.148.186.153``` to load the website.

# Most important things to Remember
## These values need to kept update to date throughout the semester. <br>
## <strong>Failure to do so will result it points be deducted from milestone submissions.</strong><br>
## You may store the most of the above in this README.md file. DO NOT Store the SSH key or any keys in this README.md file.
