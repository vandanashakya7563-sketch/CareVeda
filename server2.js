var express = require("express");

var app = express();

app.use(express.static("public"));

require('dotenv').config();

app.listen(2006, function () {
   console.log("server started");
})

app.get("/", function (req, resp) {
   var path = __dirname + "/public/index.html";
   resp.sendFile(path);
})

app.use(express.urlencoded(true)); // covert post data to json object

app.use("/pics", express.static("pics"))   // agar pics folder me se pics uthani h to ye line add krni padegi. taki express ko pta lag jaye ye folser pics ka url h



//============my sql database connection=======//


var mysql = require("mysql2");
let url = process.env.AIVEN_URL;
let mysqlCon = mysql.createConnection(url);
mysqlCon.connect(function (err) {
   if (err == null)
      console.log("connected succesfully");
   else
      console.log(err.message);
})


//============using AJAX=================//

app.get("/Check-email", function (req, resp) {
   //===========check email available or not===========//

   let email = req.query.emailkuch;
   mysqlCon.query("select * from profiles where email=?", [email], function (err, resultJSONAry) {
      if (err == null) {
         if (resultJSONAry.length == 1)
            resp.send("Already occupied");
         else
            resp.send("available")
      }
      else
         resp.send(err.message);
   })
})

//===============send data to server using Ajax of Signup FORM============//
app.get("/signup-process", function (req, resp) {



   let email = req.query.emailKuch;
   let pwd = req.query.pwdKuch;
   let utype = req.query.utypeKuch;
   let active = 1;
   mysqlCon.query("insert into userspro values(?,?,?,CURRENT_DATE(),?)", [email, pwd, utype, active], function (err) {
      if (err == null)
         resp.send("SIGNUP SUCESSFULLY");
      else
         resp.send(err.message);
   })

})

//==========login ========================//
app.get("/login-process", function (req, resp) {
   let email = req.query.emailLogin;
   let pwd = req.query.pwdLogin;

   mysqlCon.query("select * from userspro where email=? and pwd=?", [email, pwd], function (err, resultJSONAry) {

      if (err == null) {

         if (resultJSONAry.length == 1) {

            if (resultJSONAry[0].active == 1)
              resp.send(resultJSONAry[0].utype);
            else
               resp.send("Invalid UserID or Password");
         }
         else
            resp.send("Invalid UserID or Password");
      }
      else
         resp.send(err.message);
   }
   );

})
//--------------------donor and avail linking-----------//       9 june work
app.get("/Donor-profile", function (req, resp) {
   var path = __dirname + "/public/DONOR-PROFILE.html"
   resp.sendFile(path);
})

app.get("/Avail-medicine", function (req, resp) {
   var path = __dirname + "/public/Avail-Med.html"
   resp.sendFile(path);
})

//---------FILE UPLAOD CONNECTION TO CLOUDINAR-------------
var fileuploader = require("express-fileupload");
app.use(fileuploader());

var cloudinary = require("cloudinary").v2;

require('dotenv').config();
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUD_API,
   api_secret: process.env.API_SECRET
});



//----------------send DONOR data to server-------
app.post("/send-donor-data-to-server", async function (req, resp) {

   //-------------- pic UPLAODING ----------------
   let msg = "file not uploaded";

   let AdharCardpathURL = " nopic.jpg";
   let profilePicpathURL = "nopic.jpg";                   //Agar user photo upload na kare to default image ka naam store kiya.
   if (req.files != null) {                                 //Check kiya ki user ne koi file upload ki hai ya nahi.
      // -----ADAHAR CARD-PIC---------
      let filename_AC = req.files.adharPic.name;                   //Uploaded Aadhaar photo ka original naam nikala.
      let fullpath_AC = __dirname + "/pics/" + filename_AC;         //File ko kis location par save karna hai uska path banaya.
      await req.files.adharPic.mv(fullpath_AC);                    //Aadhaar photo ko uploads folder me save (move) kar diya.
      msg = "ADHAR  uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath_AC).then(function (picUrlResult) {
         AdharCardpathURL = picUrlResult.url;                     //will give u the url of ur pic on cloudinary server   (Cloudinary se mili image ki URL ko variable me store kiya.)
         console.log("************")
         console.log(AdharCardpathURL);                             //Console me uploaded Aadhaar image ki URL print ki.
      });


      // -----profile PIC---------      //PFP_D= Profile-pic-donor
      let filename_PFP_D = req.files.profilePic.name;
      let fullpath_PFP_D = __dirname + "/pics/" + filename_PFP_D;
      await req.files.profilePic.mv(fullpath_PFP_D);
      msg = "profile pic uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath_PFP_D).then(function (picUrlResult_PFP_D) {
         profilePicpathURL = picUrlResult_PFP_D.url;
         console.log("************")
         console.log(profilePicpathURL);
      });
   }


   //------------------------
   let email = req.body.Email;
   let name = req.body.txtname;
   let mobile = req.body.mobileNum;
   let address = req.body.Address;
   let city = req.body.city;
   mysqlCon.query("insert into dprofiles values(?,?,?,?,?,?,?)", [email, name, mobile, address, city, AdharCardpathURL, profilePicpathURL], function (err) {
      if (err == null)
         resp.send(" donor data send to server sucessfully");
      else
         resp.send(err.message);
   })


})
//-------------------------------------
//----------------Modify data-------
app.post("/modify-data", async function (req, resp) {

   //------------------------------
   let msg = "file not uploaded";

   let AdharCardpathURL = " nopic.jpg";
   let profilePicpathURL = "nopic.jpg";                   //Agar user photo upload na kare to default image ka naam store kiya.
   if (req.files != null) {                                 //Check kiya ki user ne koi file upload ki hai ya nahi.
      // -----ADAHAR CARD-PIC---------
      let filename_AC = req.files.adharPic.name;                   //Uploaded Aadhaar photo ka original naam nikala.
      let fullpath_AC = __dirname + "/pics/" + filename_AC;         //File ko kis location par save karna hai uska path banaya.
      await req.files.adharPic.mv(fullpath_AC);                    //Aadhaar photo ko uploads folder me save (move) kar diya.
      msg = "ADHAR  uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath_AC).then(function (picUrlResult) {
         AdharCardpathURL = picUrlResult.url;                     //will give u the url of ur pic on cloudinary server   (Cloudinary se mili image ki URL ko variable me store kiya.)
         console.log("************")
         console.log(AdharCardpathURL);                             //Console me uploaded Aadhaar image ki URL print ki.
      });


      // -----profile PIC---------      //PFP_D= Profile-pic-donor
      let filename_PFP_D = req.files.profilePic.name;
      let fullpath_PFP_D = __dirname + "/pics/" + filename_PFP_D;
      await req.files.profilePic.mv(fullpath_PFP_D);
      msg = "profile pic uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath_PFP_D).then(function (picUrlResult_PFP_D) {
         profilePicpathURL = picUrlResult_PFP_D.url;
         console.log("************")
         console.log(profilePicpathURL);
      });
   }


   //------------------------
   let email = req.body.Email;
   let name = req.body.txtname;
   let mobile = req.body.mobileNum;
   let address = req.body.Address;
   let city = req.body.city;
   mysqlCon.query("update dprofiles set name=?,mobile=?,address=?,city=?,acardpath=?,profilePicpath=? where email=?", [name, mobile, address, city, AdharCardpathURL, profilePicpathURL, email], function (err) {
      if (err == null)
         resp.send(" donor data Modified sucessfully");
      else
         resp.send(err.message);
   })


})

//---------------------Ajax------------------
//----------------ftech get profile button//
app.get("/get-profile-data-btn-fetch", function (req, resp) {

   let email = req.query.emailIDkuch;

   mysqlCon.query("select * from dprofiles where email=?", [email], function (err, resultJSONAry) {
      if (err == null) {
         resp.send(resultJSONAry);
      }
      else
         resp.send(err.message);
   })
})



//-----------send AVAIL MED data to server-------------
app.post("/send-AVAIL-MED-data-to-server", async function (req, resp) {
   //------med pic upload setup-----
   let msg = "file not uploaded";
   let MedpicpathURL = " nopic.jpg";
   if (req.files != null) {
      let filename_medpic = req.files.medPic.name;
      let fullpath_medpic = __dirname + "/pics/" + filename_medpic;
      await req.files.medPic.mv(fullpath_medpic);
      msg = "medicine pic uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath_medpic).then(function (picUrlResult_med) {
         MedpicpathURL = picUrlResult_med.url;
         /*  console.log("************")
           console.log(MedpicpathURL);     */
      });
   }

   let email = req.body.Email;
   let medname = req.body.medName;
   let expdate = req.body.expDate;
   let company = req.body.company;
   let packing = req.body.packing;
   let qty = req.body.qty;
   let info = req.body.info;

   mysqlCon.query("insert into availMED values(?,?,?,?,?,?,?,?,?)", [null, email, medname, expdate, company, packing, qty, info, MedpicpathURL], function (err) {
      if (err == null)
         resp.send("Medicine Record added sucessfully");
      else
         resp.send(err.message);
   })



})


//----------avail-Equipment linking           10 june work
app.get("/Avail-equipment", function (req, resp) {
   var path = __dirname + "/public/avail_EQUIPMENT.html"
   resp.sendFile(path);
})

//send avail equipment data to server-------------------------

app.post("/avail-for-needys", async function (req, resp) {

   //-------------- pic UPLAODING ----------------
   let msg = "file not uploaded";

   let pic1url = " nopic.jpg";
   let pic2url = "nopic.jpg";
   if (req.files != null) {
      // -----PIC 1---------
      let filename1 = req.files.equipPic1.name;
      let fullpath1 = __dirname + "/pics/" + filename1;
      await req.files.equipPic1.mv(fullpath1);
      msg = "pic 1 uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath1).then(function (picUrlResult1) {
         pic1url = picUrlResult1.url;
         console.log(pic1url);
      });


      // ----- PIC 2---------      
      let filename2 = req.files.equipPic2.name;
      let fullpath2 = __dirname + "/pics/" + filename2;
      await req.files.equipPic2.mv(fullpath2);
      msg = "pic 2 uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath2).then(function (picUrlResult2) {
         pic2url = picUrlResult2.url;

         console.log(pic2url);
      });
   }


   //------------------------
   let email = req.body.Email;
   let equipment_type = req.body.equipType;
   let equip_condition = req.body.condition;
   let type = req.body.type;
   let amount;
   if (type == "donation") {
      amount = 0;
   }
   else {
      amount = req.body.amount;
   }
   let info = req.body.info;

   mysqlCon.query("insert into equipments values(?,?,?,?,?,?,?,?,?)", [null, email, equipment_type, equip_condition, type, amount, pic1url, pic2url, info], function (err) {
      if (err == null)
         resp.send(" Equipmant  data send to server sucessfully");
      else
         resp.send(err.message);
   })


})
//-----------------------Angular js              14 july

//---------SIGNUP FORM
//----------admin-user-dashboard linking to index
app.get("/Admin-User-dashboard", function (req, resp) {
   var path = __dirname + "/public/admin-user-dash.html"
   resp.sendFile(path);
})
//==========Data fecthing ========================//
app.get("/admin-users-data-fetch", function (req, resp) {
   

   mysqlCon.query("select * from userspro", function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//---------------Delete button--------
 app.get("/do-delete", function (req, resp) {

    let email = req.query.emailKeyKuch;      // ? is called in parameter
    mysqlCon.query("delete from userspro where email=? ", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record deleted sucessfully");

            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})

//---------Block User----------------
app.get("/do-block", function (req, resp) {

    let email = req.query.emailKeyKuch;      // ? is called in parameter
    mysqlCon.query("update userspro set active=? where email=? ", [0,email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User Blocked");

            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})
//---------Resume User----------------
app.get("/do-Resume", function (req, resp) {

    let email = req.query.emailKeyKuch;      // ? is called in parameter
    mysqlCon.query("update userspro set active=? where email=? ", [1,email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User Resumed");

            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})

//-------------------------DONORS DATA FETCH----------
//----------admin-Donor-dashboard linking to index
app.get("/Admin-Donors-dashboard", function (req, resp) {
   var path = __dirname + "/public/admin-donors-dash.html"
   resp.sendFile(path);
})
//==========Data fecthing ========================//
app.get("/admin-donors-data-fetch", function (req, resp) {
   

   mysqlCon.query("select * from dprofiles", function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//---------------Delete button--------     
app.get("/do-delete-donor", function (req, resp) {

    let email = req.query.emailKeyKuch;      // ? is called in parameter

    console.log(email);   // <-- ye add karo

    mysqlCon.query("delete from dprofiles where email=? ", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record deleted sucessfully");

            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})


//-------------------DONOR DASH ---------   ---------------------------------
app.get("/Donors-dashboard", function (req, resp) {
   var path = __dirname + "/public/dash-donor.html"
   resp.sendFile(path);
})

//---------------------------Medicine Manager------------------------
//----------------fetch medicine data on medicine Manager-------------------
app.get("/Med-data-fetch", function (req, resp) {
   
 let email = req.query.emailKeyKuch;

   console.log("Email =", email);

   mysqlCon.query("select * from availMED where email=?", [email],  function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//-----------------Delete button----------------
app.get("/do-delete-med-data", function (req, resp) {

    let rid = req.query.ridKuch;

    mysqlCon.query("delete from availMED where r_ID=?", [rid], function (err, result) {

        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record deleted successfully");
            else
                resp.send("Invalid Record");
        }
        else
            resp.send(err.message);
    });
});


//------------------------------EUIPMENT mANAGER--------------------

//----------------fetch Equip data on medicine Manager-------------------
app.get("/Equip-data-fetch", function (req, resp) {
   
 let email = req.query.emailKeyKuch;

   console.log("Email =", email);

   mysqlCon.query("select * from equipments where email=?", [email],  function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//-----------------Delete button----------------
app.get("/do-delete-equip-data", function (req, resp) {

    let rid = req.query.ridKuch;

    mysqlCon.query("delete from equipments where r_ID=?", [rid], function (err, result) {

        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record deleted successfully");
            else
                resp.send("Invalid Record");
        }
        else
            resp.send(err.message);
    });
});

//----------------Update Password   Setting Modal----------------
app.get("/update-password", function (req, resp) {

    let email = req.query.emailKeyKuch;
    let oldPwd = req.query.oldPwdKuch;
    let newPwd = req.query.newPwdKuch;

    mysqlCon.query(
        "update userspro set pwd=? where email=? and pwd=?",[newPwd, email, oldPwd],function (err, result) {

            if (err == null) {

                if (result.affectedRows == 1)
                    resp.send("Password Updated Successfully...");
                else
                    resp.send("Invalid Email or Existing Password");

            }
            else
                resp.send(err.message);

        }
    );

});

//----------------Admin-Dashboard-----------------
app.get("/Admin-dashboard", function (req, resp) {
   var path = __dirname + "/public/Admin-dash.html"
   resp.sendFile(path);
})

//---------all medicine page linking----------
app.get("/All-medicines", function (req, resp) {
   var path = __dirname + "/public/All-medicines.html"
   resp.sendFile(path);
})

//-------fetch all medicnes data-----------
app.get("/fetch-all-medicine-data", function (req, resp) {
   

   
   mysqlCon.query("select * from availMED ",  function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//-----------------View details----------------
app.get("/fetch-med-Detail-in-view-details", function (req, resp) {

    let rid = req.query.ridKuch;

    mysqlCon.query("select *  from availMED where r_ID=?", [rid], function (err, resultJSONAry) {

        if (err == null) 
         
                resp.send(resultJSONAry);

        else
            resp.send(err.message);
    });
});



//-------------------------MEDCINE FINDER PAGE--------------------------
app.get("/medicine-finder", function (req, resp) {
   var path = __dirname + "/public/med-Finder.html"
   resp.sendFile(path);
})
//========== distinct cities fetching from donor ========================//
app.get("/fetch-all-cities", function (req, resp) {
   

   mysqlCon.query("select distinct city from dprofiles", function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})


//========== distinct medname fetching inner join with donors emaail  in sleelcted city  ========================//
app.get("/fetch-all-medicine-name-in-that-selected-city", function (req, resp) {
   
let city = req.query.cityKuch;
console.log(city);
   mysqlCon.query("select distinct medname from availMED inner join dprofiles on availMED.email=dprofiles.email where  dprofiles.city=? ", [city], function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//========== medicine data show on cards on buttton click ========================//
app.get("/fetch-all-details-of-sel-medcine", function(req, resp){

    let med = req.query.medKuch;
    let city = req.query.cityKuch;

    mysqlCon.query(
        "select * from availMED inner join dprofiles on availMED.email=dprofiles.email where medname=? and city=?",
        [med, city],
        function(err, resultJSONAry){

            if(err==null)
                resp.send(resultJSONAry);
            else
                resp.send(err.message);
        }
    );

});
//---------------------show donor details-------------
app.get("/fetch-donor-details", function(req, resp){

    let rid = req.query.ridKuch;

    mysqlCon.query(
        "select *  from availMED inner join dprofiles on availMED.email = dprofiles.email where r_ID=?",[rid],function(err,resultJSONAry){

            if(err==null)
                resp.send(resultJSONAry);
            else
                resp.send(err.message);
        }
    );
});

//--------------------------------------------------------------------------------------------------

//------------------NGO REGISTRATION----------------------------------------
app.get("/NGO-REGISTRATION", function (req, resp) {
   var path = __dirname + "/public/NGO-Registration.html"
   resp.sendFile(path);
})
//-----------------send ngo data to server--------
app.post("/NGO-registration-data-to-server", async function (req, resp) {
   //------NGO pic upload setup-----
   let msg = "file not uploaded";
   let NgoPicURL = " nopic.jpg";
   if (req.files != null) {
      let filename = req.files.NgoPic.name;
      let fullpath = __dirname + "/pics/" + filename;
      await req.files.NgoPic.mv(fullpath);
      msg = "NGO pic uploaded sucessfully";

      await cloudinary.uploader.upload(fullpath).then(function (picUrlResult) {
         NgoPicURL = picUrlResult.url;
         /*  console.log("************")
           console.log(MedpicpathURL);     */
      });
   }
//-------let (apni marzi se name) = req.body.(name in HTML)          but mostly let vali side vo hi name likhte h jo datavase pe h taki confusion kam ho
   let email = req.body.Email;
   let ngo = req.body.NGOName;
   let regoffice = req.body.Regoffice;
    let city = req.body.city;
    let website = req.body.website;
    let contactno = req.body.contactNo;
    let since = req.body.since;
    let chairperson = req.body.chairperson;
    let ngoworks = req.body.NgoWorks;
    let regnumber = req.body.RegNo;
                                                            //yaha vo name likhne h jo upar let kiye h
   mysqlCon.query( "insert into ngos values(?,?,?,?,?,?,?,?,?,?,?)",[email,ngo, regoffice, city, website, contactno, since, chairperson,ngoworks,regnumber,NgoPicURL], function (err) {
      if (err == null)
         resp.send("NGO Registered Successfully");
      else
         resp.send(err.message);
   })

})

//-------------------------NGO Finder---------------------------------
app.get("/NGO-finder", function (req, resp) {
   var path = __dirname + "/public/NGO-Finder.html"
   resp.sendFile(path);
})
//========== select distinct cities fetching from ngo resgistered  ========================//
app.get("/fetch-all-cities-ngos", function (req, resp) {
   

   mysqlCon.query("select distinct city from ngos", function (err, resultJSONAry) {
    if (err == null) {
            resp.send(resultJSONAry);
        }
        else
            resp.send(err.message);
      
   });

})

//==========  show ngos  on cards on buttton click of selected city ========================//
app.get("/fetch-ngos-of-sel-city", function(req, resp){

   
    let city = req.query.cityKuch;

    mysqlCon.query("select * from ngos  where city=?",[ city],function(err, resultJSONAry){

            if(err==null)
                resp.send(resultJSONAry);
            else
                resp.send(err.message);
        }
    );

});

//==========   ngos  contact details button ========================//
app.get("/fetch-ngo-contact-details", function(req, resp){

   
    let email = req.query.emailKuch;

    mysqlCon.query("select * from ngos  where email=?",[email],function(err, resultJSONAry){

            if(err==null)
                resp.send(resultJSONAry);
            else
                resp.send(err.message);
        }
    );

});

//--------------Equip finder--------------------------
app.get("/Equip-finder", function (req, resp) {
   var path = __dirname + "/public/Equip-Finder.html"
   resp.sendFile(path);
})

//================ Fetch All Equipment Cities =================

app.get("/fetch-all-equipment-cities",function(req,resp){

    mysqlCon.query("select distinct city from dprofiles",function(err,result){

            if(err==null)
                resp.send(result);
            else
                resp.send(err.message);
        }
    );
});

//================ Search Equipment =================

app.get("/search-equipment",function(req,resp){

    let city=req.query.cityKuch;
    let type=req.query.typeKuch;
    mysqlCon.query("select * from equipments inner join dprofiles on equipments.email=dprofiles.email where city=? and type=?",[city,type],function(err,result){

            if(err==null)
                resp.send(result);
            else
                resp.send(err.message);
        }
    );
});
//================ Fetch Equipment Owner Details =================
app.get("/fetch-equipment-details",function(req,resp){

    let rid=req.query.ridKuch;

    mysqlCon.query(

        "select * from equipments inner join dprofiles on equipments.email=dprofiles.email where r_ID=?",

        [rid],

        function(err,result){

            if(err==null)
                resp.send(result);
            else
                resp.send(err.message);

        });

});

//--------------------NEEDY PROFILE----------------------
app.get("/needy-profile", function (req, resp) {
   var path = __dirname + "/public/needy.html"
   resp.sendFile(path);
})

// Gemini AI Library
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: "AQ.Ab8RN6KCaUlQhkxJLEfQQ3Gc-4CD7j3Cox2KPcEef9YD40pj3A"
});



//==================== FRONT AADHAAR ====================
async function ai_fetchdata_aadhar(imgurl) {

    const myprompt = "Read the Aadhaar card front image and return ONLY JSON format {aadhar_number:'',name:'',gender:'',dob:''}. DOB should be YYYY-MM-DD.";

    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",

    contents: [
        {
            role: "user",
            parts: [
                { text: myprompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: Buffer.from(imageResp).toString("base64")
                    }
                }
            ]
        }
    ]
});

    const cleaned = result.text
    .replace(/```json|```/g, "")
    .trim();

    return JSON.parse(cleaned);
}


//==================== REAR AADHAAR ====================
async function ai_fetchdata_aadharrear(imgurl) {

    const myprompt = "Read the Aadhaar card back image and return ONLY JSON format {address:''}.";

    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",

    contents: [
        {
            role: "user",
            parts: [
                { text: myprompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: Buffer.from(imageResp).toString("base64")
                    }
                }
            ]
        }
    ]
});

    const cleaned = result.text
    .replace(/```json|```/g, "")
    .trim();
    return JSON.parse(cleaned);
}
//======================

app.post("/ai-read-pic", async function (req, resp) {

    let jsonResultFromAi;
    let jsonResultFromAirear;

    let fronturl = "nopic.jpg";

    if (req.files != null && req.files.apicf != null) {

        let fileName = req.files.apicf.name;
        let fullPath = __dirname + "/pics/" + fileName;

        await req.files.apicf.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {

            fronturl = picUrlResult.url;

            jsonResultFromAi = await ai_fetchdata_aadhar(fronturl);

        });
    }

    let rearurl = "nopic.jpg";

    if (req.files != null && req.files.apicr != null) {

        let fileName = req.files.apicr.name;
        let fullPath = __dirname + "/pics/" + fileName;

        await req.files.apicr.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {

            rearurl = picUrlResult.url;

            jsonResultFromAirear = await ai_fetchdata_aadharrear(rearurl);

        });
    }

    let email = req.body.txtEmail;
    let mobile = req.body.mobile;


    console.log("Front AI Data:", jsonResultFromAi);
console.log("Rear AI Data:", jsonResultFromAirear);

if (!jsonResultFromAi) {
    return resp.send("Front Aadhaar AI Read Failed");
}

if (!jsonResultFromAirear) {
    return resp.send("Rear Aadhaar AI Read Failed");
}

    let name = jsonResultFromAi.name;
    let acardno = jsonResultFromAi.aadhar_number;
    let gender = jsonResultFromAi.gender;
    let dob = jsonResultFromAi.dob;

    let address = jsonResultFromAirear.address;

    mysqlCon.query(
        "insert into needys values(?,?,?,?,?,?,?,?,?)",
        [
            email,
            mobile,
            fronturl,
            rearurl,
            name,
            acardno,
            address,
            gender,
            dob
        ],
        function (err) {

            if (err == null)
                resp.send("Registration Successful");

            else
                resp.send(err.message);

        }
    );

});



//============NGO -DASH===========
app.get("/ngo-dash", function (req, resp) {
   var path = __dirname + "/public/dash-ngo.html"
   resp.sendFile(path);
})

//============needy dash===========
app.get("/needy-dash", function (req, resp) {
   var path = __dirname + "/public/needy-dash.html"
   resp.sendFile(path);
});


//=====ADMIN PASS SETT======
app.use(express.json());

app.post("/admin-login", function (req, res) {

    let password = req.body.password;

    if (password === "vandana7563") {

        res.json({
            success: true
        });

    } else {

        res.json({
            success: false
        });

    }

});











