LOGIN=$(curl http://localhost:8099/auth/v2/login/ -H "content-type:application/json" --data '{"username":"pepesilvia","password":"carolhr"}' -X POST -s)
#echo $RESPONSE
TOKEN=$(python3 -c "import sys,json; print(json.loads(sys.argv[1])['data']['token'])" $LOGIN )

curl 'http://localhost:8099/calculator/v2/history?fromDate=2023-01-01&untilDate=2023-12-12&minAmount=0.00&maxAmount=9999999.99&LIMIT=10&PAGE=1&ORDERBY=amount&ORDERING=DESC' -H "content-type:application/json" -X GET -H "x-access-token: $TOKEN"