# API Docs

##  `GET` - Get all jobs  `/api/joblist` 
**Project Independent** api call - retrieves all the jobs in the DB (No pagination). 

## `POST` - Create a new job `/api/createjob` 
**Project Independent** api call - requires **headers** for successful transactions.
### Request Template: 
```
{
	"moduleslist": "{enter valid module names}",
	"triggerby": "{enter username}",
	"project": "{enter project name}"
}
```
### Response Template 
```
{
	"acknowledged": true,
	"insertedId": "{idDetails}"
}
```
## `GET` - Get all jobs of particular user  `/api/joblist/{username}`
**Project Independent** API call - retrieves the latest 10 jobs created by the user.

## `GET` - Get job corresponding to ID  `/api/joblist/id/{id}`
**Project Independent** API call - retrieves data corresponding to the acknowledgement id. 

## `GET` - Get all module list of particular project  `/api/{projectname}/modulelist`
Fetches all the list of modules that are present in that particular project .

## `PUT` - Update Modules `/api/{projectname}/addmodule`
Updates the list of modules present in the project . Requires **headers** for successful transactions.
```
{
	"modules":"{moduleName}"
}
```
