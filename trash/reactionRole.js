/*
ućycie tego samego message-id z innym emoji i inną rolą powoduje, że dla innej emoji user otrzyma inną rolę
/reactionrole message-id:<> emoji:<> role:<>

zapis w db:
"server_id": {
    autorole: {
        message_id: {
            "emoji_id": "role_id"
        }
    }
}

web:
przycisk przenoszący do ustawień autoroli
switch on / off

*/