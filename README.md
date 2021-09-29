# McDebug

AES Encrypted Debug Website

# What is Debug Website

For Plugin devs, you implement this into your plugin... uploading some information to the website and the user can send you the url so you can check it and identify problems etc (like discordsrv's debug feature)

# How to use

To upload a debug report... 

### Request
Endpoint: /api/v1/createDebug
Method: Post
Content-Type: form-data

add form data parameter "data", value is aes encrypted + b64 json array. Here is an Example

```json
[
  {
    "type": "key_value",
        "name": "Some Key and Values",
    "data":[
      {
        "key":"Example Key",
        "value":"Key Value"
      },{
        "key":"Example Key 2",
        "value":"Key Value 2"
      }
    ]
  },
  {
    "type": "files", 
    "name": "Some Files",
    "data": [
      {
        "name": "test.yml", 
        "type": "yml", 
        "content":"dGVzdDogeWVzCndvcmtzOiB0cnVlICNldGM=" //b64 encoded content
      }
    ]
  }
]
```
(shouldnt include comments)

### Response
Response Example:

```json
{"id": "someid"}
```

The url to access the report would be https://url.to.website/someid#aeskey


### Result

The result of the previous data json would be

![IMAGE](https://imgur.com/35kNm0J.png)


# Hosted Version

https://mcdebug.bluetree242.tk


