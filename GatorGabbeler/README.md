The backend has been established. You can test it out by 
opening up your terminal (powershell)
ensure you are in the Gator_Gabber folder

cd GatorGabbeler
cd server 
once in the server dir 

run the command 
uvicorn app.main:app --reload --port 5050

once running follow the link (http://127.0.0.1.5050)

once in the browser change the url with addition of /docs.

you'll see a page click the down air to the right of "post"
click try it out
change the "String"
ballout 
