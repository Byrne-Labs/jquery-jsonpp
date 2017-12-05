# jquery-jsonpp
A jQuery implementation of JSONP that uses POST instead of GET.

Why?  Good question.  Some companies have the belief that a HTTP POST is inherently more secure than a HTTP GET for any type of RESTful service.  I will not waste time trying to explain how someone could arrive at this conclusion.  The unfortunate reality is that some people have to write software with these restrictions.

JSONP uses the SCRIPT tag to retrieve its payload which means it will always use a GET.  JSONPP retrieves the payload using a POST and then inserts it into a SCRIPT tag.  This allows a developer to use JSONPP exactly the same as JSONP with jQuery.  The only difference is that wherever you would you would type "jsonp", you now type "jsonpp".  Pretty easy.

