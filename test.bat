echo "Starting Tests"

echo "Getting All Posts"
curl -k -I -X GET "http://localhost:2000/api/post/" -H "Accept: */*" -H "Origin: localhost"


echo ""
curl -k -I -X GET "http://localhost:2000/api/user/a00e8530167659caaaf2/" -H "Accept: */*" -H "Origin: localhost"

pause