import { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import fs from 'fs';
import { ESRCH } from 'constants';

(async () => {

  // Init the Express application
  const express = require('express');
  const app: Express = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  let image_url: string;

  app.get("/filteredImage", async(req: Request, res: Response) => {
    let {image_url} = req.query;
  //    1. validate the image_url query
    if (!image_url){
      res.status(400).send("Invalid Request! Query is missing");
    }
    
  //    2. call filterImageFromURL(image_url) to filter the image
    filterImageFromURL(image_url).then((image) => {
  //    3. send the resulting file in the response
      fs.readFile(image, (err, data) => {
        if(err){
          res.status(422).send("Processing error. Check the files")
        }
        res.writeHead(200, {'Content-Type':'image/jpeg'});
        res.end(data);
  //    4. deletes any files on the server on finish of the response
        deleteLocalFiles(new Array(image));
      });
    }).catch(error => {
      res.status(500).send("Error in returning path.")
    });
  });

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();