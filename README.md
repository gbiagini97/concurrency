# Concurrency

With this repository we want to explore how concurrency is managed in different programming language contexts.

The test function is about:

* Retrieving a list from a file
* Performing 2 HTTP requests per element of the list
* Combining the result
* Writing the result to a file


In particular:
* The list contains 6634 ticker simbols for NYSE and NASDAQ stock exchange
* The API provider for information about tickers is [Polygon](Polygon.io)
* The result must be in JSON format

Because of the high number of HTTP requests, the performance of the script/application is usually very bad: but there's a solution.

Every language has it's own mechanism to perform parallel computation and make use of concurrency. This ability opens (virtually) the door for the script/application to make use of the entire machine.

More information is provided in each directory.
