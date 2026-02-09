 Summary
●
●
Contact the GSC+ window and provide the following information when requesting a
proxy connection
○
The currency the agent wishes to connect to (multiple currencies supported)
○
Platform server IP: API, BO
○
Agent name
○
callback URL
After creating relevant information, provide the following information to the platform:
○
Operator code - A 4-character alphanumeric operator identification code (not
case sensitive). (Agent code is a unique value for GSC+)
○
secret
_
key
○
operator
url
_
■ GSC+： https://staging.gsimw.com
■ Aurora Gaming：https://staging-idr.pglsucs.com
2.Single wallet
●
●
All API requests will use the content-type header of application/json
The time format for all requests will be a second timestamp with time zone GMT+8
2.1 Balance
Describe
Providers wishing to obtain the balance of a specific player will obtain it through this API.
Operator-side API for Seamless Wallet to retrieve a specific player's balance for the provider
EndPoint
●
POST {{callback_url}}/v1/api/seamless/balance
Parameter
Parameter Type Introduce
batch
_
requests []batc
h
_
req
uests
request information
operator
_
code string The unique identifier of the operator as the username to log
in to the backend.
currency string refer toCurrency Code
sign string md5(operator
_
code + request
_
time + “getbalance” +
secret
_
key)
Example: MD5(ABCD + 1698219740 + getbalance + XXXX)
＊Signature verification tool
https://testcase.gscplusmd.com/
request
_
time string timestamp of request time(Second)。
batch
_
requests
Parameter Type Introduce
member
_
account string The unique identifier of the member in the operator(Limit 50
characters)
product
_
code int Product's unique identifier. refer toCurrency Code
Example
{
"batch
requests":[
_
{
},
{
},
{
}
"member
account":"user1"
,
_
"product
code":1002
_
"member
account":"user2"
,
_
"product
code":1020
_
"member
account":"user3"
,
_
"product
code":1009
_
],
"operator
code":"ABCD"
,
_
"currency":"CNY"
,
"sign":"369af7416deef76a9cc4f019b8559f99"
,
"request
time":"1694617425"
_
}
Response
Parameter Type Introduce
data []data data
Data
Parameter Type Introduce
member
_
account string The unique identifier of the member in the operator(Limit 50
characters)
product
_
code int The unique identifier of the product. SeeProduct Code
balance float6
4
player balance (Support up to the fourth decimal place)
code int See Seamless wallet code
message string response message
Example
{
"data":[
{
"member
account":"user1"
_
"product
code":1002,
_
“balance":12345,
"code":0,
"message":""
,
},
{
"member
account":"user2"
,
_
"product
code":1020,
_
"balance":1000,
"code":0,
"message":""
},
{
}
"member
account":"user3"
_
"product
code":1009,
_
"balance":1000,
"code":0,
"message":""
,
]
}
2.2 Withdraw
Describe
The API is used by Seamless Wallet on the operator side for players to place bets or similar
deduction operations such as tips.
EndPoint
●
POST {{callback_url}}/v1/api/seamless/withdraw
Parameter
Parameter Type Introduce
batch
_
requests []batch
quests
re
_
request information
operator
_
code string The unique identifier of the operator logged in as
username bo
game
_
type optional
Most values are empty (used in some cases).
currency string SeeCurrency Code
sign string md5(operator
_
code + request
time + “withdraw” +
_
secret
_
key)
Example: md5(ABCD+ 1698219740 +withdraw+XXXX)
＊Signature verification tool
https://testcase.gscplusmd.com/
request
_
time string timestamp of request time(Second)。
Batch
_
Requests
Parameter Type Introduce
member
_
account string The unique identifier of the member in the operator(Limit 50
characters)
product
_
code int The unique identifier of the product. SeeProduct Code
game
_
type string SeeGame Type
transactions []Tran
sactio
transactions
n
Example
{
"batch
requests":[
_
{
"member
account":"user1"
,
_
"Product
code":1002,
_
"game
type":"POKER"
,
_
"transactions":[
{
"id":"23746"
,
"action":"bet"
"wager
"wager
"round
,
code":"tZDwLV3ayzBeP4Nvwxhcti"
_
status":"BET"
,
,
_
id":"95978"
,
_
"channel
code":"gscp"
,
_
"amount":10,
"bet
amount":10,
_
"valid
bet
amount":10,
_
_
"prize
amount":0,
_
"tip
amount":0,
_
"settled
at":0,
_
"game
_
"round
code":"moreturkeyv10000"
id":"95978"
,
_
"Channel
code":"gscp"
_
"wager
type": "NORMAL"
,
_
],
}
]
}
"operator
code":"ABCD"
,
_
"game
type": ""
,
_
"currency":"CNY"
,
"sign":"369af7416deef76a9cc4f019b8559f99"
"request
time":"1694617425"
,
_
}
Response
Parameter Type Introduce
data []data data
Data
Parameter Type Introduce
member
_
account string The unique identifier of the member in the operator(Limit
50 characters)
product
_
code int The unique identifier of the product.SeeProduct Code
before
_
balance float64 Player balance before operation (Support up to the fourth
decimal place)
balance float64 Player balance after operation (Support up to the fourth
decimal place)
code int SeeSeamless wallet code
message string response message
💡Does the transaction ID exist? If the tx
_
id exists in the carrier system and
has been refunded before, please return the duplicate transaction
Example
{
"data":[
{
"member
account":"user1"
,
_
"product
"before
code":1002,
_
balance":12345,
_
"Balance":12340,
"code":0,
"message":""
}
]
}
2.3 Deposit
Describe
The API is used by Seamless Wallet on the operator side for players to receive bonuses or
similar incremental actions, such as giving credits based on the activities the player participates
in.
Note:
1. You must accept settled deposits even if there are no bets, as some providers issue
additional promotional bonuses. Rejecting settlements due to a lack of bets will result in
players not receiving their bonus payouts.
2. The WBET product uses a special mechanism where winnings are not distributed via the
/deposit API. Instead, the operator must handle the payout manually after receiving the
/push-bet-data notification.
EndPoint
●
Parameter
POST {{callback_url}}/v1/api/seamless/deposit
Parameter Type Introduce
batch
_
requests []batch
quests
re
_
request information
operator
_
code string The unique identifier of the operator logged in as
username bo
currency string SeeProduct Code
sign string md5(operator
_
code + request
_
time + “deposit” +
secret
_
key)
Example: md5(ABCD+ 1698219740 +deposit+XXXX)
＊Signature verification tool
https://testcase.gscplusmd.com/
request
_
time string timestamp of request time(Second)。
Batch
_
Requests
Parameter Type Introduce
member
_
account string The unique identifier of the member in the operator(Limit 50
characters)
product
_
code int The unique identifier of the product. SeeProduct Code
game
_
type string SeeGame Type
transactions []Transacti
on
trade
Example
{
"batch
requests":[
_
{
"member
account":"user1"
,
_
"Product
code":1002,
_
"game
type":"POKER"
,
_
"transactions":[
{
"id":"23746"
,
"action":"settled"
,
"wager
"wager
code":"tZDwLV3ayzBeP4Nvwxhcti"
_
status":"SETTLED"
,
_
"amount":10,
"bet
amount":10,
_
"valid
bet
amount":10,
_
_
"prize
amount":10,
_
"tip
amount":0,
_
"settled
at":1729134752372,
_
"game
_
"round
code":"moreturkeyv10000"
,
id":"95978"
,
_
"Channel
code":"gscp"
_
"wager
type": "NORMAL"
,
_
],
}
]
}
"operator
code":"ABCD"
,
_
"currency":"CNY"
,
"sign":"369af7416deef76a9cc4f019b8559f99"
"request
time":"1694617425"
_
,
}
Response
Parameter Type Introduce
data []data data
Data
Parameter Type Introduce
member
_
account string The unique identifier of the member in the operator(Limit 50
characters)
product
_
code int The unique identifier of the product. SeeProduct Code
before
_
balance float64 Player balance before operation (Support up to the fourth
decimal place)
balance float64 Player balance after operation (Support up to the fourth
decimal place)
code int SeeSeamless wallet code
message string response message
💡Does the transaction ID exist? If the id exists in the carrier system and
has been refunded before, please return the duplicate transaction
Example
{
"data":[
{
"member
account":"user1"
_
"product
"before
code":1002,
_
balance":12345,
_
,
"balance":12340,
"code":0,
"message":""
}
]
}
2.4 Push Bet Data
Describe
It is a seamless wallet API on the operator side, used to synchronize all data and status of bets.
EndPoint
●
Parameter
POST {{callback_url}}/v1/api/seamless/pushbetdata
Parameter Type Introduce
operator
_
code string The unique identifier of the operator, used as the
background login username.
wagers wagers wagers for this operation.
sign string md5(operator
_
code + request
_
time + “pushbetdata” +
secret
_
key)
Example: md5(ABCD+ 1698219740+pushbetdata+XXXX)
＊Signature verification tool
https://testcase.gscplusmd.com/
request
_
time string timestamp of request time(Second)。
Example
String parseJS eval fails
{
"operator
code":"CMUT
_
_
"wagers":[
{
V2"
,
"member
account":"s0350"
,
"bet
_
amount":"10"
,
_
"valid
bet
amount":"10"
,
_
_
"prize
"tip
_
"wager
"wager
"wager
"round
amount":"10"
,
_
amount":"0"
,
type":"NORMAL"
,
_
code":"tZDwLV3ayzBeP4Nvwxhcti"
_
status":"SETTLED"
,
_
id":"95978"
,
_
"channel
code":"gscp"
,
_
"game
type":"POKER"
,
_
"settled
at":1697439181000,
_
"created
at":1697435181000,
_
"payload":{
},
"product
code":"1001"
"game
_
code":"1001"
,
_
"currency":"CNY"
,
,
},
{
"member
account":"s0351"
,
"bet
_
amount":"100"
,
_
"valid
bet
amount":"100"
,
_
_
"prize
"tip
_
"wager
"wager
"wager
"round
amount":"10"
,
_
amount":"0"
,
_
type":"NORMAL"
,
code":"txDwLV5aazBeP4evwxhcti"
_
status":"SETTLED"
,
_
id":"95785"
,
_
"game
_
"settled
type":"POKER"
,
at":1697439181000,
_
"created
at":1697438182000,
_
"payload":{
},
"product
code":"1001"
"game
_
code":"1001"
,
_
"currency":"CNY"
,
,
}
],
"request
"sign":"369af7416deef76a9cc4f019b8559f99"
time":"1694617425"
_
,
}
Response
Parameter Type Introduce
code int message string Example
{
"code":0,
"message":""
,
}
SeeSeamless wallet code
response message
3.Operator (Operator)
3.1 Launch Game （Launch Game）
EndPoint
●
Parameter
POST {{operator_url}}/api/operators/launch-game
Parameter Type Introduce Must
operator
_
code String The unique identifier of the
operator, used as the background
login user name。
Must
member
_
account String The unique identifier of the member
in the operator.(Limit 50 characters)
Must
password String The member's password in the
operator's system, used to verify
identity.
Must
nickname String The member's nickname displayed
in the game.
No
currency String The currency used by members in
the game. Make sure the currency
is supported by the provider.
SeeCurrency code
Must
game
_
code String A unique identifier within the game
list API given by the provider.
Required if the provider supports
direct play, no otherwise.
Optional, depending on
provider
product
_
code int The unique identifier of the product.
SeeProduct code
Must
game
_
type String SeeGame type Must
language
_
code String The member's language code.
SeeLanguage code。
ip String The member’s IP address. platform String platform type
(SABA Sports Match Link Please
select Widget)
widget
_
id String SABA Sports Quick Bet Widget ID.
If a value is passed, the default
card widget is obtained
(staging environment classic widget
ID: 1lx2FADe)
Reference Documentation
is
_
widget
_
login bool SABA Sports Quick Bet Widget ID
Login Status
true = Login mode
false or not provided = Non-login
mode
sign String md5(request
time + secret
_
“launchgame” + operator
_
_
key +
code)
Example:
md5(1694617425XXXXlaunchgam
eCMUT
_
V2)
＊Signature verification tool
https://testcase.gscplusmd.com/
request
_
time int timestamp of request time(Second)
。
operator
_
lobby_
u
rl
string Client site URL Example
{
"operator
"member
code":"CMUT
V2"
,
_
_
account":"s0350"
,
_
"password":"e10adc3949ba59abbe56e057f20f883e"
"nickname":"test123"
,
,
"currency":"IDR"
,
No, default is 0
Must
Must.
Enum includes WEB,
DESKTOP, and
MOBILE, Widget
No
No
Must
Must
Must
"game
code":null,
_
"product
code":1001,
_
"game
type":"Slot"
,
_
"language
code":0,
_
"ip":"127.0.0.1"
,
"platform":"WEB"
,
"sign":"977e0ad6dd5c9f953a5b7681d2fa9fb8"
"request
time":1694617425,
_
"operator
lobby
url":"https://URL"
,
_
_
}
Response
Parameter Type Introduce
Code int SeeCarrier code
Message string error message
URL string The URL used to launch the game or provider's lobby.
Content string HTML content for displaying games from a specific provider
Example
{
"code":200,
"message":""
,
"url":"https://dev-test.spribe.io/games/launch/aviator?currency=USD&lang=EN&user=test
9&operator=efinity&token=NCVKnX2cTPDDfLUfQ7UtXB"
}
3.2 Wager List (Wager List)
EndPoint
●
GET {{operator_url}}/api/operators/wagers
Parameter
Parameter Type Introduce Must
operator
_
code string The unique identifier of the operator, used as
the background login username.
Must
start int The start time of the settlement time search
range（Timestamp millisecond）。
Must
end int The end time of the settlement time search
range（Timestampmillisecond）。
Must
(≤ 5 minutes.)
offset int The starting record number for this capture. No
size int The number of records fetched this time. No
(default=5000)
sign String md5(request
+ operator
_
time + secret
_
_
code)
key + “getwagers”
Example:
md5(1694617425XXXXgetwagersCMUT
_
＊Signature verification tool
https://testcase.gscplusmd.com/
V2)
Must
request
_
time int64 Timestamp of request time.
Must
Example
https://example.com/api/operators/wagers?operator
_
code=E004&sign=xxxxxx&request
_
69155100?start=169155100000&end=169155100000
time=1
Response
Name Type
wagers Wager
pagination Pagination
Example
{
"wagers":[
{
"id":3,
"code":"e8bf16ae-07c8-4663-a22e-4e441f12e65e"
"member
account":"test3"
,
_
"round
id":"95978"
,
_
"currency":"USD"
,
"provider
id":0,
_
"provider
line
id":0,
_
_
"provider
product
id":0,
_
_
"provider
product
oid":1138,
_
_
"game
type":"poker"
,
_
"game
code":"dice"
,
_
"valid
bet
amount":0.10,
_
_
"bet
amount":0.10,
_
"prize
amount":0,
_
"status":"BET"
,
"payload":null,
"settled
at":0,
_
"created
at":1691149098011,
_
"updated
at":1691149098011
_
,
}
],
"pagination":{
"size":1000,
"total":1234
}
}
3.3 Wager (Wager)
EndPoint
●
Parameter
GET {{opeartor_url}}/api/operators/wagers/{{id/code}}
Parameter Type Introduce Must
operator
_
code string The unique identifier of the operator, used as
the background login username.
Must
sign String md5(request
time + secret
_
_
+ operator
_
code)
key + “getwager”
Must
Example:
md5(1694617425XXXXgetwagerCMUT
_
＊Signature verification tool
https://testcase.gscplusmd.com/
V2)
request
_
time int64 Timestamp of request time.
Must
Request
https://staging.effinitymd.com/api/operators/wagers/3?operator
_
code=E004&sign=xxxxxx&requ
est
time=169155100
_
Response
Name Type
wager Wager
Example
{
"wager":{
"id":3,
"code":"e8bf16ae-07c8-4663-a22e-4e441f12e65e"
,
"member
account":"test3"
,
_
"round
id":"95978"
,
_
"currency":"USD"
,
"provider
id":0,
_
"provider
line
id":0,
_
_
"provider
product
id":0,
_
_
"provider
product
oid":1138,
_
_
"game
type":"poker"
,
_
"game
code":"dice"
,
_
"valid
bet
amount":0.10,
_
_
"bet
amount":0.10,
_
"prize
amount":0,
_
"status":"BET"
,
"payload":null,
"settled
at":0,
_
"created
at":1691149098011,
_
"updated
at":1691149098011
_
}
}
3.4 Game List (Game List)
Used to obtain all games that the operator has signed with GSC+. Only games with
signed contracts will be displayed.
EndPoint
●
GET {{operator_url}}/api/operators/provider-games
Parameter
Parameter Type Introduce Must
product
_
code int The unique identifier of the product. Must
operator
_
code string The unique identifier of the operator, used as
the background login username.
Must
game
_
type String SeeGame Type No
sign String md5(request
time + secret
_
_
operator
_
code)
key + “gamelist” +
Example:
md5(1694617425XXXXgamelistCMUT
_
V2)
＊Signature verification tool
https://testcase.gscplusmd.com/
Must
request
_
time int64 Timestamp of request time. Must
offset int The starting record number for this search. No
size int The number of records retrieved this time. No (if not
included, all will
be displayed)
Response
Scope Type Introduce
code int See operator code Operator Code
message string error message
provider
_game
s
array Reference gameGames
pagination object Pagination
Response
{
"code":0,
"message":""
"provider
_
{
,
games":[
"game
code":"aviator"
,
_
"game
name":"Aviator"
,
_
"game
type":"POKER"
,
_
"image
url":"https://images.gscplusmd.com/statics/staging/images/games
_
/1/POKER/aviator.png"
,
"product
id":1,
_
"product
code":1138,
_
"support
currency":"USD"
,
_
"status":"ACTIVAT"
"allow
free
round": true
_
_
"lang
name": {
_
"0": "Aviator"
,
"1": "Aviator"
,
"12": "Aviator"
"2": "Aviator"
,
"3": "Aviator"
,
"33": "Aviator"
"39": "Aviator"
"4": "Aviator"
,
"5": "Aviator"
,
"6": "Aviator"
,
"7": "Aviator"
,
,
,
,
"9": "Aviator"},
"lang
icon": {
_
/aviator.png"
,
/aviator.png"
,
R/aviator.png"
/aviator.png"
,
/aviator.png"
,
R/aviator.png"
R/aviator.png"
"0":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"1":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"12":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
,
"2":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"3":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"33":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
,
"39":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
,
},
{
"4":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"
,
"5":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"
,
"6":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"
,
"7":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"
,
"9":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"},
"created
at": 1738570027673
_
"game
code":"aviator"
,
_
"game
name":"Aviator"
,
_
"game
type":"POKER"
,
_
"image
url":"https://images.gscplusmd.com/statics/staging/images/games
_
/1/POKER/aviator.png"
,
"product
id":1,
_
"product
code":1138,
_
"support
currency":"IDR"
,
_
"status":"ACTIVATED"
"allow
free
round": true
_
_
"lang
name": {
_
"0": "Aviator"
,
"1": "Aviator"
,
"12": "Aviator"
"2": "Aviator"
,
"3": "Aviator"
,
"33": "Aviator"
"39": "Aviator"
"4": "Aviator"
,
"5": "Aviator"
,
"6": "Aviator"
,
"7": "Aviator"
,
,
,
,
"9": "Aviator"},
"lang
icon": {
_
/aviator.png"
,
/aviator.png"
,
R/aviator.png"
/aviator.png"
,
/aviator.png"
,
R/aviator.png"
R/aviator.png"
/aviator.png"
,
/aviator.png"
,
/aviator.png"
,
"0":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"1":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"12":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
,
"2":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"3":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"33":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
,
"39":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
,
"4":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"5":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"6":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
},
{
},
"7":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"
,
"9":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
/aviator.png"},
"created
at": 1738570027673
_
"game
code":"dice"
,
_
"game
name":"Dice"
,
_
"game
type":"POKER"
,
_
"image
url":"https://images.gscplusmd.com/statics/staging/images/games
_
/1/POKER/dice.png"
,
"product
id":1,
_
"product
code":1138,
_
"support
currency":"USD"
,
_
"status":"ACTIVATED"
"allow
free
round": true
_
_
"lang
name": {
_
"0": "Dice"
,
"1": "Dice"
,
"12": "Dice"
"2": "Dice"
,
"3": "Dice"
,
"33": "Dice"
"39": Dice"
,
"4": "Dice"
,
"5": "Dice"
,
"6": "Dice"
,
"7": "Dice"
,
,
,
"9": "Dice"},
"lang
icon": {
_
/Dice.png"
,
/Dice.png"
,
R/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
R/Dice.png"
,
R/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
/Dice.png"},
"created
"0":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"1":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"12":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
"2":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"3":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"33":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
"39":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
"4":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"5":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"6":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"7":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"9":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
at": 1738570027673
_
{
"game
code":"dice"
,
_
"game
name":"Dice"
,
_
"game
type":"POKER"
,
_
"image
url":"https://images.gscplusmd.com/statics/staging/images/games
_
/1/POKER/dice.png"
,
"product
id":1,
_
"product
code":1138,
_
"support
currency":"IDR"
,
_
"status":"ACTIVATED"
"allow
free
round": true
_
_
"lang
name": {
_
"0": "Dice"
,
"1": "Dice"
,
"12": "Dice"
"2": "Dice"
,
"3": "Dice"
,
"33": "Dice"
"39": Dice"
,
"4": "Dice"
,
"5": "Dice"
,
"6": "Dice"
,
"7": "Dice"
,
,
,
"9": "Dice"},
"lang
icon": {
_
/Dice.png"
,
/Dice.png"
,
R/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
R/Dice.png"
,
R/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
/Dice.png"
,
/Dice.png"}},
"created
"0":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"1":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"12":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
"2":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"3":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"33":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
"39":"https://images.gscplusmd.com/statics/staging/images/games/1/POKE
"4":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"5":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"6":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"7":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
"9":"https://images.gscplusmd.com/statics/staging/images/games/1/POKER
at": 1738570027673
_
},
],
"pagination":{
"size":10,
"offset":0,
"total":"2000"
}
}
3.5 Game History (Game History)
EndPoint
●
GET {{operator_url}}/api/operators/{wager_code}/game-history
Parameter
Parameter Type Introduce Must
operator
_
code string The operator's unique identifier, used as the
backend login username.
Must
sign String md5(request time + secret
_
key +
"gamehistory" + operator code)
example :
md5(1694617425XXXXproductlistCMUT
_
＊Signature verification tool
https://testcase.gscplusmd.com/
Must
V2)
request
_
time int64 Timestamp of request time. Must
Response
{
}
"content":"https://"
＊The PG Soft product returns content in HTML format, and you will need to handle the display
adjustment on your end.
3.6 Product List (Product List)
EndPoint
●
GET {{operator_url}}/api/operators/available-products
Parameter
Parameter operator
_
code sign request
_
time offset size Response
Parameter provider currency status provider
_
id product
_
id product
_
code game
_
type product
_
name Example
Type string String int64 int int Type string string string int int int string string Introduce The unique identifier of the operator, used as
the background login username.
md5(request time + secret
_
+ operator code)
key + "product list"
example :
md5(1694617425XXXXproductlistCMUT
_
＊Signature verification tool
https://testcase.gscplusmd.com/
V2)
Timestamp of request time. The starting record number obtained this time The number of records obtained this time Introduce
Provider's name
currency code, seeCurrency code
product status
Provider's unique identifier
product unique identifier
OID unique identifier of the product,
seeProduct code
Game types in Seamless Games, seeGame
type
Provider's product name
Must
Must
No
Must
No
No (if not
included, all
will be
displayed)
[
{
"provider":"SBO"
,
"currency":"IDR2"
,
"status":"MAINTAINED"
"provider
id":2,
_
"product
id":1190,
_
"product
code":1012,
_
"game
type":"POKER"
,
_
"product
name":"sbo"
_
,
},
{
"provider":"SBO"
,
"currency":"IDR2"
,
"status":"ACTIVATED"
"provider
id":2,
_
"product
id":1189,
_
"product
code":1012,
_
"game
type":"SPORT
_
_
"product
name":"sbo"
,
BOOK"
,
_
}
]
3.7 Turn on Super Lobby
*Please first ensure that you have completed the integration and docking of the single wallet
API. Once completed, please contact us if you would like to connect with Super Lobby.
EndPoint
●
POST {{operator_url}}/superlobby/launch
Parameter
Parameter Type Introduce Must
operator
_
code String The unique identifier of the
operator, used as the background
login username.
Must
member
_
account String The unique identifier of the
member in the operator.
Must
nickname String The member's nickname
displayed in the game.
Must
currency String The currency used by members
in the game. Make sure the
currency is supported by the
provider. SeeCurrency Code。
language
_
code String The member's language code.
SeeLanguage Code。
platform String Platform Type sign String md5(request
time + secret
_
_
“launchsuperlobby” +
operator
_
code)
key +
Example:
md5(1694617425XXXXlaunchsup
erlobbyCMUT
_
V2)
＊Signature verification tool
https://testcase.gscplusmd.com/
request
_
time int timestamp of request time（
Second）。
type int Open lobby type operator
_
lobby_
url string Client site URL Example
{
"operator
"member
code":"CMUT
V2"
,
_
_
account":"s0350"
,
_
"currency":"IDR"
,
"language
code":0,
_
"platform":"WEB"
,
"sign":"fc607f037e87fbf9cfac419423e43144"
"request
time":1694617425,
_
"type":0,
,
"operator
lobby
url":"https://test.com"
_
_
}
Must
No, default is 0
Must.
Enum includes WEB,
DESKTOP, and
MOBILE.
Must
Must
No, default 0: SUPER
LOBBY
1: AURORA LIVE
Must
Respond
Parameter Type Introduce
url string The URL used to launch Super Lobby/Aurora LIVE.
Example
{
}
"url":"https://lobby.gsimw.com/#/home?t=iQhpYErFQBm6Wqu8WL5abc"
3.8 Create Free Round for Player
Please ensure the Single Wallet API integration has been completed. If you wish to
integrate the FreeRound feature, please contact us.
Endpoint
●
Parameters
POST {{operator
_
url}}/api/operators/create-free-round
Parameter Type Description Required
operator
_
code String Unique identifier of the operator (same
as backend login username)
Yes
member
_
account String Unique member account identifier in the
operator system (max 50 characters)
Yes
currency String Player’s in-game currency. Make sure it
is supported by the provider. See
currency codes.
Yes
product
_
code Integer Product unique ID. See product code list. Yes
game
_
type String See game types. Yes
start
_
at Integer Free round start time (Unix timestamp) Yes
end
_
at Integer Free round end time (Unix timestamp) Yes
rounds Integer Number of free rounds sign String Signature: md5(request
time +
_
secret
_
key + "createfreeround" +
operator
_
code)
＊Signature verification tool
https://testcase.gscplusmd.com
request
_
time Integer Request timestamp (in seconds) channel
_
code String Channel code, e.g., gscp game
_
list Array List of games and corresponding bet
values
game
_
list[].gameId String Unique game identifier game
_
list[].betValues Array List of betting values. Refer to section
3.11 GetGamesBetScales
betValues.betPerLine Float Bet per line amount.Please refer to the
FreeRound bet parameter settings table.
betValues.totalBetAmo
unt
float otal bet amount. Please refer to the
FreeRound bet parameter settings table.
betValues.currency String Currency used in the game Example
{
"operator
"member
code": "CMUT
V2"
,
_
_
account": "s1023"
,
_
"currency": "IDR"
,
"product
code": 1006,
_
"game
type": "SLOT"
,
_
"start
at": 1752105600,
_
"end
at": 1752940800,
_
"rounds": 10,
"game
list": [
_
{
"gameId": "vs20sugarrush"
,
Yes
Yes
Yes
Yes
Yes
Yes
Yes
Yes (choose
one, mutually
exclusive with
betValues.to
talBetAmount)
Yes(choose one,
mutually
exclusive with
betValues.be
tPerLine)
Yes
"betValues": [
{
"betPerLine": 0.05,
"totalBetAmount": 0,
"currency": "IDR"
}
]
}
],
"request
"channel
"sign": "36227604e220ea0e2c8e806736f58401"
time": 1752054762,
_
code": "gscp"
,
_
}
Response
Parameter Type SS
bonus
_
code String Unique FreeRound ID, can be referenced in wallet transaction via
Payload.bonus_code
Example
{
}
"bonus
code":"7dfc41a2-960e-4fd8-b812-6ebe9b194777"
_
3.9 Cancel Free Round (CancelFreeRound)
lease ensure the Single Wallet API integration has been completed. If you wish to
integrate the FreeRound feature, please contact us.
Use this API to cancel a previously created FreeRound campaign by specifying the
bonus_code.
EndPoint
●
POST {{operator_url}}/api/operators/cancel-free-round
Parameters
Parameter Type Description operator
_
code String Operator’s unique ID (backend
login username)
currency String Player’s game currency. Ensure it
is supported by the provider
product
_
code Integer Product unique ID bonus
_
code String Unique FreeRound ID (from
section 3.8)
sign String Signature: md5(request
time +
_
secret
_
key + "cancelfreeround" +
operator
_
code)
＊Signature verification tool
https://testcase.gscplusmd.com
request
_
time Integer Request timestamp (in seconds) channel
_
code String VVVVVChannel code, e.g., gscp Example
{
"operator
code": "CMUT
V2"
,
_
_
"currency": "IDR"
,
"product
code": 1006,
_
"game
type": "SLOT"
,
_
"bonus
code": "10868087-1ef9-4b9d-bd62-7226cb26e7f4"
_
"request
"channel
"sign": "01ee0b21e2e127fa6df08ef4fc5129c5"
time": 1752054762,
_
code": "gscp"
,
_
,
}
Required
Yes
Yes
Yes
Yes
Yes
Yes
Yes
Response
Parameter type Description
bonus
_
code string FreeRound unique order number
例子
{
}
"bonus
code":"7dfc41a2-960e-4fd8-b812-6ebe9b194777"
_
3.10 Get Player Free Round Bonus (GetPlayerFRB)
Please ensure the Single Wallet API integration has been completed. If you wish to integrate the
FreeRound feature, please contact us.
This API retrieves a player's current FreeRound bonus information using their account and
related identifiers.
EndPoint
●
Parameter
GET {{operator_url}}/api/operators/get-player-frb
Parameter Type Description Required
operator
_
code String Operator’s unique identifier Yes
member
_
account String Member’s unique identifier (max 50
characters)
Yes
currency String Player’s currency Yes
product
_
code Integer Product ID Yes
game
_
type String Game type Yes
sign String Signature: md5(request
time +
_
secret
_
key + "getplayersfrb" +
operator
_
code)
＊Signature verification tool
https://testcase.gscplusmd.com
Yes
request
_
time Integer Timestamp in seconds Yes
channel
_
code String Channel code, e.g., gscp Yes
Example
https://example.com/api/operators/get-player-frb?operator
code=CMUT
V2&member
account=
_
_
_
s1023&currency=IDR&product
_
code=1006&sign=22711668739a77102f4a5b54cd64d233&requ
est
time=1752054762&channel
_
_
code=gscp&game
_
type=SLOT
回应
Parameter Type Description
bonuses Array List of Free Round bonus entries
bonuses.currency String Currency used by the player in-game. Ensure it is supported
by the provider. See currency codes.
bonuses.gameIDList String List of unique game identifiers
bonuses.rounds int Total number of Free Rounds granted
bonuses.roundsPlayed int Number of Free Rounds that have been used
bonuses.bonus
_
code String Unique FreeRound order ID. Refer to section 3.8 Create
Free Round
bonuses.expirationDate String The time when the free round expires (format:
YYYY-MM-DD HH:mm).
Response
{
"code": 0,
"message": ""
"bonuses": [
{
,
"currency": "IDR"
,
"gameIDList": [
"vs20sugarrush"
,
],
"rounds": 10,
"roundsPlayed": 0,
"bonus
code": "7dfc41a2-960e-4fd8-b812-6ebe9b194777"
,
_
"expirationDate": "2025-07-19 16:00"
}
]
}
3.11 Get Game Bet Scales( GetGamesBetScales)
Please ensure the Single Wallet API integration has been completed. If you wish to integrate the
FreeRound feature, please contact us.
Use this API to query supported bet configurations per game and currency.
EndPoint
●
GET {{operator_url}}/api/operators/get-bet-scales
Parameters
Parameter Type Description Required
operator
_
code String Operator’s unique identifier Yes
currency String Currency used in game. Must be supported by
provider
Yes
product
_
code Integer Product unique ID Yes
game
_
type String Game type Yes
bet
_game
_
list String Comma-separated game IDs (max 50). Commas
must be URL encoded (%2C)
Yes
sign String Signature: md5(request
time + secret
_
"getbetscales" + operator
_
code)
＊Signature verification tool
https://testcase.gscplusmd.com
_
key +
Yes
request
_
time Integer Timestamp in seconds Yes
channel
_
code String Channel code, e.g., gscp Yes
Example
https://example.com/api/operators/get-bet-scales?operator
code=CMUT
_
_
V2&currency=IDR&pr
oduct
code=1006&bet
_
_game
_
list=vs20olympgold&sign=0b98fd6db161704c6a476fbd1ac7d0fe
&request
time=1752054762&channel
_
_
code=gscp&game
_
type=SLOT
Response
Parameter Type Description
betScales Array List of game bet scale configurations
betScales.gameID String Unique identifier of the game
betScales.betScaleLi
Array Currency-based bet scale configurations for the game
st
betScaleList.currenc
String y
Currency used by the player in-game. Ensure it is
supported by the provider. See currency codes.
betScaleList.betPerL
ineScales
float Array of bet amounts per line, sorted in ascending order
(Display Condition: Applicable only to products that use
the “bet per line” mode.)
betScaleList.totalBet
Scales
float Array of total bet amount options
(Display Condition: Applicable only to products that use
the “total bet amount” mode.)
Response
{
"code": 0,
"message": ""
,
"betScales": [
{
"gameID": "vs20olympgold"
"betScaleList": [
{
,
"currency": "IDR"
,
"betPerLineScales": [
10,
20,
30,
40,
50,
60,
80,
100,
150,
200,
250,
300,
350,
400,
450,
500,
750,
1000,
1500,
2000,
2500,
3000,
4000,
4500,
5000,
7500,
10000,
15000,
20000,
25000,
30000,
35000,
40000,
45000,
50000,
60000
],
"totalBetScales": []
},
]
},
]
}
3.12 Wallet Balance Inquiry
Retrieve the current wallet balance for the currencies contracted under the operator.
EndPoint
●
GET {{operator_url}}/api/operators/wallet-balance
Parameters
Parameter Type Description Required
operator
_
code string The unique identifier of the operator; used
as one of the signature parameters.
yes
sign string md5(request
time + secret
_
_
key +
"getwalletcurrencies" + operator
_
code)
Example： md5(1761195600123 +
secret
_
key + "getwalletcurrencies" + GSC1)
＊Signature verification tool
https://testcase.gscplusmd.com
yes
request
_
time int64 Request timestamp (milliseconds). yes
Example
https://{{operator
_
url}}/api/operators/wallet-balance?operator
_
code=GSC1&sign=
xxxxxxxx&request
time=1761195600123_
Response
Parameter Type code int message string data.operator
_
code string data.is
_
credit bool data.currencies[].currency string data.currencies[].current
_
balance number data.currencies[].updated
_
at string Description
Status code (0 = success)
Response message
Unique identifier of the operator, used as the
back-office login username.
Whether it is credit mode (true = credit, false =
buy-in mode)
Currency code
Current balance, displayed up to 4 decimal places
Last updated time (Unix timestamp in milliseconds)
Example
{
"code": 0,
"message": "Success"
,
"data": {
"operator
code": "GSC1"
_
"is
credit": false,
_
"currencies": [
{
,
"currency": "MYR"
,
"current
balance": 12000.5000,
_
"updated
at": "1761532461134"
_
},
{
"currency": "IDR"
,
"current
balance": 4500000.2500,
_
"updated
at": "1761532461134"
_
},
{
"currency": "VND2"
,
"current
balance": 350000.0000,
_
"updated
at": "1761532461134"
_
},
{
"currency": "THB"
,
"current
balance": 87000.0000,
_
"updated
at": "1761532461134"
_
},
{
"currency": "USD"
,
"current
balance": 950.0000,
_
"updated
at": "1761532461134"
_
}
]
}
}
Appendix
Seamless wallet code
Code Describe
0 success
999 Internal Server Error
1000 API member does not exist
1001 API member balance is insufficient
1002 API proxy key error
1003 Duplicate API transactions
1004 API signature is invalid
1005 API not getting game list
1006 API bet does not exist
2000 API product is under maintenance
Carrier Code
Code Describe
200 success
999 Internal Server Error
10002 Invalid parameter
Pagination
Name Type Describe
size integer The number of records you get
total integer Total number of records in a given time interval
offset Integer Start record number of this retrieval.
Game Type
Code Describe
SLOT Slot
LIVE
CASINO Live Casino
_
SPORT
_
BOOK Sport Book
VIRTUAL
_
SPORT Virtual Sport
LOTTERY Lottery
QIPAI Qipai
P2P P2P
FISHING Fishing
COCK
_
FIGHTING Cock Fighting
BONUS Bonus
ESPORT ESport
POKER Poker
OTHERS Others
LIVE
CASINO
_
_
MIUM
PRE
Live Casino
Premium
Product Code
ID Code
1009 CQ9
1020 WM Casino
1022 Sexy_gaming
1033 SV388cockfighting
1050 PlayStar
1055 MrSlotty
1056 TrueLab
1058 BGaming
1060 Volt Entertainment
1062 Fazi
1064 Netgame
1065 Kiron
1067 RedRake
1070 1080 1097 1098 1101 1102 1138 1139 1149 1148 1006 1011 1016 1091 1018 1012 1052 1085 1049 1153 1154 1157 Booongo
Venus
FuntaGaming
Felix
ZeusPlay
KAGaming
Spribe
Fastspin
AI Live Casino
WOW Gaming
Pragmatic Play
Play Tech
YeeBet
Jili tcg
live
22
_
SBO
DreamGaming
JDB
Evoplay
Hacksaw
Bigpot
IMoon
1161 1166 1167 1172 1183 1152 1168 1169 1040 1184 1079 1046 1185 1002 1038 1191 1007 1156 1158 1004 1160 1163 TADA
NO LIMIT CITY (ASIA)
BIG TIME GAMING (ASIA)
WORLD ENTERTAINMENT
FB SPORT
1XBET
Netent（ASIA）
Red Tiger（ASIA）
WBET
RICH88
Fachai
IBC-SABA
SA Gaming
Evolution Gaming（ASIA）
King855/CT855
King855/CT855
PG Soft
Betfair
Pascal Gaming
BigGaming
EPICWIN
NOVOMATIC
1162 1165 1164 1170 1171 1173 1174 1175 1176 1177 1115 1186 1187 1192 1197 1194 1203 1221 1204 1222 1220 1205 Octoplay
aviatrix
DIGITAIN
smartsoft
FIABLE GAMES
Evolution (LATAM)
Netent (LATAM)
Red Tiger (LATAM)
no limit city (LATAM)
big time gaming(LATAM)
BOOMING GAMES
ENDORPHINA
WINFINITY
AMIGO GAMING
Habanero
PRETTY GAMING
PlayAce
SPADE GAMING
ADVANTPLAY
TF Gaming
ASTAR
AMBPOKER
1206 1207 1225 1229 1223 1224 1230 1231 1232 1233 1227 1237 1239 1228 1238 1007 1091 1240 1241 1244 1242 1235 SlotXO(AMB)
PG SOFT (AMB)
JOKER
PANDA SPORTS
ALLBET
GEMINI
BETSOLUTIONS
SIMPLE PLAY
QQKENO
NEX4D
UG
KAIYUANGAMING
Hotdog
CMD
KA Gaming (Direct Line)
PG Soft (THB)
JE:JILI
TCG SEA LOTTO
TCG LOTTO
BETBY
PLAYTECH(Q6)
IM SPORTS
1236 1250 1258 1251 1249 1253 1261 1255 1256 1257 1259 1252 1263 1247 1254 1262 1274 1266 1260 1268 1269 1273 IM ESPORTS
UUSlots
LE GAMING
Micro Gaming
3SING
Gaming Panda
ATG
DRAGOON SOFT
YGR
BOLE GAMING
5G
Q Tech
Oriental Gaming
DB LOTTERY
AVIATOR
BNG
EVOPLAY YFG
VG棋牌
BGAMING
MegaWin
MT LIVE
PNG
1264 Vimplay
1271 GX WICKETS
1243 BTI
1270 LUCKYSPORTS
1275 YGGDRASIL YGG
1276 AVATAR UX YGG
1277 WINFAST YGG
1278 RELAX GAMING YGG
1281 SABAPLAY
1284 ROYAL SLOT GAMING
1290 YEEBET2
1272 TURBO
Transaction (Transaction)
Parameter Type Describe
id string Transaction ID
action string Transaction action type,
Withdraw:
Supported action types include
BET,TIP,ROLLBACK,ADJUSTMEN
T, etc.
Deposit:
amount currency valid
bet
_
_
amount bet
_
amount prize
_
amount tip_
amount wager
_
code wager
_
status round
_
id payload settled
_
at product
_
code game
_
code string string stirng string string string string string string JSON int64 int string Supported action types include
SETTLED, JACKPOT, BONUS,
PROMO, LEADERBOARD,
ROLLBACK, CANCEL
,ADJUSTMENT, etc.
Push Bet Data:
Does not involve balance changes,
only used for synchronizing bet
data and status.
referenceTransaction Action Type
The amount needs to be changed
to the player's wallet. Positive
value indicates recharge, negative
value indicates deduction.
SeeCurrency Code。
Effective bet amount
Bet amount
Payout amount
Tip amount
Bet ID in Seamless
bet status,reference bet status
Provider's turn ID in the game
Provider transaction details
Reward time(timestamp)
Unique identifier for the product,
see product code
(Appears only with 2.4 PushBet)
Game Code (Required if the
provider supports direct game
entry; otherwise, null.)
Wagers (Wagers)for Push Bet Data
Parameter Type Describe
member
_
account string The account number of the member in the operator
bet
amount _
decimal Total bet amount.
valid
bet
_
_
amount decimal The effective bet amount actually deducted. May
differ from bet amount
prize
_
amount decimal The player's winning amount. If the player lost, it is 0.
tip_
amount string Tip amount
wager
_
type string Bet mark (bet=NORMALl , manual free
spin=FREEROUND)
wager
_
code string Code for bet (for checking)
wager
_
status string bet status, see bet status
round
_
id string Provider's turn ID in the game
channel
_
code string Channel code, such as gscp
game
_
type string Game types in Seamless, seeGame Type
settled
at _
int64 Time when bets are settled
created
at _
int64 The time the bet was created
payload json Some information about the provider
product
_
code int The OID unique identification of the product,
seeProduct Code
game
_
code string Provider's game code (Required if the provider
supports direct game entry; otherwise, null.)
currency string Currency code, seeCurrency Code
Wager (Wager)
Parameter Type id id wager
_
code string agent
_
code string member
_
account string round
_
id string currency string provider
_
id int provider
line
_
_
id int povider
_product
_
id int product
_
code int product
name _
int wager
_
type string game
_
type string game
_
code string valid
bet
_
_
amount decimal bet
amount _
decimal prize
_
amount decimal status string payload json Describe
ID of the bet (used for association)
Code for bet (is wager
_
code for checking)
The code for the agent in the operator
The account number of the member in the operator
Provider's turn ID in the game
Currency code, seeCurrency Code
Provider's unique identifier
Product line unique identifier
Product unique identifier
The OID unique identification of the product,
seeProduct Code
Product Name
Bet mark (bet=NORMALl , manual free
spin=FREEROUND)
Game types in Seamless, seeGame Type
Provider's game code (Required if the provider
supports direct game entry; otherwise, null.)
The effective bet amount actually deducted. May
differ from bet amount
Total bet amount.
The player's winning amount. If the player lost, it is
0.
bet status, see bet statu
Some information about the provider
settled
at _
int64 Time when bets are settled
created
at int64 The time the bet was created
_
updated
_
at int64 When bets are updated
Wager Status (Wager Status)
State Describe
BET The bet is in the betting stage
BONUS Multiple prizes are distributed in the
same round
SETTLED Bet settled
RESETTLED Bets have been resettled
VOID Bets are void
💡NOTE: In some edge cases, transfer requests fitaction type “RESETTLED”
possible to cause a player's balance to become negative, such as a fractional
change, which often occurs in sports betting games.
，It is
Language Code (Language Code)
State Describe
0 English
1 Traditional Chinese
2 Simplify Chinese
3 Thai
4 Indonesia
5 Japanese
6 Korea
7 Vietnamese
8 Deutsch
9 Espanol
10 Francais
11 Russia
12 Portuguese
13 Burmese
14 Danish
15 Finnish
16 Italian
17 Dutch
18 Norwegian
19 Polish
20 Romanian
21 Swedish
22 Turkish
23 Bulgarian
24 Czech
25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 Greek
Hungarian
Brazilian Portugese
Slovak
Georgian
Latvian
Ukrainian
Estonian
Filipino
Cambodian
Lao
Malay
Cantonese
Tamil
Hindi
European Spanish
Azerbaijani
Brunei Darussalam
Croatian
Currency Code (Currency Code)
Note: When the currency ratio is 1:1000, operators are required to perform the conversion
themselves before responding with the balances. This is due to certain provider requirements,
as the currency value is too small.
幣別（Currency） 比例
AED 1:1
AFN 1:1
ALL 1:1
AMD 1:1
ANG 1:1
AOA 1:1
ARS 1:1
AUD 1:1
AWG 1:1
AZN 1:1
BAM 1:1
BBD 1:1
BDT 1:1
BDT2 1:1000
BGN 1:1
BHD 1:1
BIF 1:1
BMD 1:1
BND 1:1
BOB 1:1
BRL 1:1
BRL2 1:1000
BSD 1:1
BTC 1:1
BTN 1:1
BWP 1:1
BYN 1:1
BZD 1:1
CAD 1:1
CDF CDF2 CHF CLF CLP CNY CNY2 COP COP2 CRC CSD CUC CUP CVE CZK DJF DKK DOGE DOP DZD EGP ERN ETB ETH EUR EUR2 FJD FKP FRF FTN GBP GC GEL GGP GHS 1:1
1:1000
1:1
1:1
1:1
1:1
1:1000
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
GIP GMD GNF GTQ GYD HKD HKD2 HNL HRK HTG HUF IDR IDR2 ILS IMP INR INR2 IQD IRR IRR2 ISK JEP JMD JOD JPY JPY2 KES KGS KHR KHR2 KRW KRW2 KSH KWD KZT 1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1000
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1000
1:1
1:1000
1:1
1:1
1:1
LAK LAK2 LBP LBP2 LKR LRD LSL LTC LYD MAD MAD2 MBTC MDL METH MGA MKD MMK MMK2 MMK3 MNT MNT2 MOP MRU MVR MWK MXBT MXN MXN2 MYR MYR2 MYR3 MZN NAD NGN NGN2 1:1
1:1000
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:100
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1000
1:100
1:1
1:1
1:1
1:1000
NIO NOK NOT NPR NPR2 NTD NZD OMR PAB PEN PGK PHP PHP2 PKR PKR2 PLN PTI PTV PYG PYG PYG2 QAR RON RSD RUB RWF SAR SBD SC SCR SDG SEK SGD SGD2 SHP 1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
SLL SOS SRD SSP STD STN SVC SYP SZL THB THB2 TJS TMT TND TON TOP TRY TRY2 TTD TWD TWD2 TZS TZS2 UBTC UGX UGX2 USD USD2 USDC USDT USDT2 UXBT UYU UZS UZS2 1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1
1:1
1:1
1:1
1:1000
1:1
1:1
1:1000
1:1
1:1000
1:1
1:1
1:1000
1:1
1:1000
1:1
1:1
1:1000
1:1
1:1
1:1
1:1000
VES 1:1
VND 1:1
VND2 1:1000
VND3 1:100
VUV 1:1
WST 1:1
XAF 1:1
XCD 1:1
XDR 1:1
XOF 1:1
XPF 1:1
YER 1:1
ZAR 1:1
ZMW 1:1
ZWL 1:1
Transaction Action Type（Transaction Action Type）
Action Code Describe
BET
The transaction type for placing bets. The operator shall deduct the amount
from the player's wallet.
FREEBET
Bonus deal type for free bets. Operators should increase the amount of
players' wallets.
SETTLED
Bonus transaction type for win or draw. Operators should increase the amount
of players' wallets.
ROLLBACK
Type of transaction to cancel bets and/or wins. When the amount is positive,
the operator should increase the amount in the player's wallet, otherwise it
should be deducted. You need to confirm that the bet exists and is a SETTLE
CANCEL
ADJUSTMENT
JACKPOT
BONUS
TIP
PROMO
LEADERBOARD
BET_PRESERVE
PRESERVE_REFUND
Games
Description game
_
code Cancel bet transaction type. Operators should increase the amount of players'
wallets. You need to confirm that the bet exists and is a BET
The type of transaction that adjusts the bet amount. When the amount is
positive, the operator should increase the amount in the player's wallet,
otherwise it should be deducted.
Bonus transaction type for the jackpot. Operators should increase the amount
of players' wallets.
The type of transaction on which the bonus is placed. Operators should
increase the amount of players' wallets.
The type of transaction in which the tip is placed. The operator shall deduct the
amount from the player's wallet.
The transaction type of event reward. Operators should increase the amount of
players' wallets.
The transaction type rewarded by the leaderboard event. Operators should
increase the amount of players' wallets.
A type of transaction that reserves an amount of money before placing a bet, in
case the player's balance is insuﬃcient for subsequent bets. The operator shall
deduct the amount from the player's wallet.
The transaction type that refunds the reserved amount. Operators should
increase the amount of players' wallets.
Type Description
string Game code, used for launch game
game
_
name string Game name
game
_
type string Game type, see Game Type
product
id _
int32
product
_
code int32 Id for each provider product, see
Product Code
status string Current game status
DEACTIVATED: Game is
deactivated. Unable to launch
ACTIVATED: Game is valid to
launch
MAINTAINED: game is under
maintained.
support
_
currency string Support currency, related to
currency that operator signed with
GSC+
.
allow
free
_
_
round int Whether manual Free Round are
supported
lang_
name string Display game names in multiple
languages (default to English).
Language Code
lang_
icon string Display localized game entry image
URL (default to English
image)Language Code
created
_
at Unix Timestamp
(milliseconds)
Creation time
FreeRound bet parameter settings table
Code Product Name Parameter Used Notes
1006 Pragmatic Play betValues.betPerLine The game adopts the “bet per
line” mode. Must return
betPerLine, and leave
totalBetAmount empty.
1148 WOW Gaming betValues.totalBetAmount The game adopts the “total bet
amount” mode. Must return
totalBetAmount, and leave