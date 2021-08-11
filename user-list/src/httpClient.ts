// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* 
 Setup: Enter your storage account name and shared key in main()
*/

import { BlobServiceClient } from "@azure/storage-blob";


// Load the .env file if it exists
import * as dotenv from "dotenv";
import { createReadStream } from "fs";
import { Readable } from "stream";
dotenv.config();
 
export  interface RoomDao {
	 name: string;
	 userlist: string[];
	 title: string;
	 isBusy: boolean;
}
export async function addUserToStorageList(username : string) {
    const STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING || "";
    // Note - Account connection string can only be used in node.
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);

  let i = 1;
  for await (const container of blobServiceClient.listContainers()) {
    console.log(`Container ${i++}: ${container.name}`);
  }


  const containerClient = blobServiceClient.getContainerClient("userliststorage");
const blockClient = containerClient.getBlockBlobClient("rooms.json");
let downloadBlockBlobResponse  = await blockClient.download(0);
let rooms = JSON.parse(await (streamToString(downloadBlockBlobResponse.readableStreamBody)));
if(rooms.name == "Hilda") {
    let users1 = [];
    users1 = rooms.users;
    users1.push(username);  
    const unique = [...new Set(users1)];
    rooms.users = unique;
}

const uploadBlobResponse = await blockClient.upload(JSON.stringify(rooms), JSON.stringify(rooms).length, 
 {
     "blobHTTPHeaders" : {"blobContentType" : "application/json"}
 });
console.log(`Upload block blob successfully`, uploadBlobResponse.requestId);


// await writeToContainer(rooms[0], blockClient);

  // Delete container

}

async function streamToString(readableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
      
    });
  }


export async function deleteUserFromList(username : string) {
    const STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING || "";
    // Note - Account connection string can only be used in node.
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);

  let i = 1;
  for await (const container of blobServiceClient.listContainers()) {
    console.log(`Container ${i++}: ${container.name}`);
  }


  const containerClient = blobServiceClient.getContainerClient("userliststorage");
  const blockClient = containerClient.getBlockBlobClient("rooms.json");
  let downloadBlockBlobResponse  = await blockClient.download(0);
  let rooms = JSON.parse(await (streamToString(downloadBlockBlobResponse.readableStreamBody)));
  if(rooms.name == "Hilda") {
      rooms.users = rooms.users.filter(item => item != username);
  }
  
  const uploadBlobResponse = await blockClient.upload(JSON.stringify(rooms), JSON.stringify(rooms).length, 
   {
       "blobHTTPHeaders" : {"blobContentType" : "application/json"}
   });
  console.log(`Upload block blob successfully`, uploadBlobResponse.requestId);



}
