const fs = require('fs');
const path = require('path');

// Sample training data for different skills
const skillQuestionsData = {
  "C++": {
    "category": "Programming",
    "questions": [
      {
        "question": "What is a pointer in C++?",
        "correct_answer": "A variable that stores the memory address of another variable",
        "incorrect_answers": [
          "A data type for storing characters",
          "A function that points to another function",
          "A loop construct"
        ]
      },
      {
        "question": "What is the difference between 'new' and 'malloc' in C++?",
        "correct_answer": "'new' calls the constructor, 'malloc' only allocates memory",
        "incorrect_answers": [
          "'new' is faster than 'malloc'",
          "'malloc' is more memory efficient",
          "There is no difference"
        ]
      },
      {
        "question": "What is a virtual function in C++?",
        "correct_answer": "A function that can be overridden in derived classes",
        "incorrect_answers": [
          "A function that runs in virtual memory",
          "A function that cannot be called directly",
          "A function that only works with pointers"
        ]
      },
      {
        "question": "What is the purpose of 'const' keyword in C++?",
        "correct_answer": "To make variables or functions read-only",
        "incorrect_answers": [
          "To make code run faster",
          "To reduce memory usage",
          "To make variables global"
        ]
      },
      {
        "question": "What is a template in C++?",
        "correct_answer": "A way to write generic code that works with different data types",
        "incorrect_answers": [
          "A pre-written code snippet",
          "A file format for C++",
          "A type of variable"
        ]
      },
      {
        "question": "What is the difference between deep copy and shallow copy in C++?",
        "correct_answer": "Deep copy creates independent objects, shallow copy shares references",
        "incorrect_answers": [
          "There is no difference",
          "Deep copy is faster than shallow copy",
          "Shallow copy is more memory efficient"
        ]
      },
      {
        "question": "What is RAII in C++?",
        "correct_answer": "Resource Acquisition Is Initialization - automatic resource management",
        "incorrect_answers": [
          "A type of loop construct",
          "A memory allocation technique",
          "A debugging tool"
        ]
      },
      {
        "question": "What is the purpose of 'static' keyword in C++?",
        "correct_answer": "To create class-level variables or functions that belong to the class, not instances",
        "incorrect_answers": [
          "To make variables constant",
          "To improve performance",
          "To create global variables"
        ]
      },
      {
        "question": "What is a smart pointer in C++?",
        "correct_answer": "A pointer that automatically manages memory allocation and deallocation",
        "incorrect_answers": [
          "A pointer that is faster than regular pointers",
          "A pointer that can only point to smart objects",
          "A pointer that prevents errors"
        ]
      },
      {
        "question": "What is the difference between struct and class in C++?",
        "correct_answer": "By default, struct members are public, class members are private",
        "incorrect_answers": [
          "Structs are faster than classes",
          "Classes can only have methods, structs can only have data",
          "There is no difference"
        ]
      }
    ]
  },
  "JavaScript": {
    "category": "Programming",
    "questions": [
      {
        "question": "What is closure in JavaScript?",
        "correct_answer": "A function that has access to variables in its outer scope",
        "incorrect_answers": [
          "A way to close browser windows",
          "A method to end loops",
          "A type of variable declaration"
        ]
      },
      {
        "question": "What is the difference between '==' and '===' in JavaScript?",
        "correct_answer": "'==' compares values with type coercion, '===' compares values and types",
        "incorrect_answers": [
          "'==' is faster than '==='",
          "'===' only works with numbers",
          "There is no difference"
        ]
      },
      {
        "question": "What is hoisting in JavaScript?",
        "correct_answer": "The behavior of moving declarations to the top of their scope",
        "incorrect_answers": [
          "A way to lift elements on a webpage",
          "A method to organize code",
          "A type of function"
        ]
      },
      {
        "question": "What is a Promise in JavaScript?",
        "correct_answer": "An object representing the eventual completion of an asynchronous operation",
        "incorrect_answers": [
          "A guarantee that code will run",
          "A type of variable",
          "A way to make HTTP requests"
        ]
      },
      {
        "question": "What is the 'this' keyword in JavaScript?",
        "correct_answer": "A reference to the object that is currently executing the code",
        "incorrect_answers": [
          "A way to refer to the current function",
          "A reference to the global object",
          "A type of variable declaration"
        ]
      },
      {
        "question": "What is async/await in JavaScript?",
        "correct_answer": "A syntax for handling asynchronous operations more cleanly than Promises",
        "incorrect_answers": [
          "A way to make code run faster",
          "A type of loop construct",
          "A method to create classes"
        ]
      },
      {
        "question": "What is the event loop in JavaScript?",
        "correct_answer": "A mechanism that handles asynchronous operations by managing the call stack and callback queue",
        "incorrect_answers": [
          "A way to create infinite loops",
          "A type of event listener",
          "A method to handle errors"
        ]
      },
      {
        "question": "What is prototypal inheritance in JavaScript?",
        "correct_answer": "A mechanism where objects inherit properties and methods from other objects through prototypes",
        "incorrect_answers": [
          "A way to copy objects",
          "A type of class inheritance",
          "A method to create functions"
        ]
      },
      {
        "question": "What is the difference between let, const, and var in JavaScript?",
        "correct_answer": "let and const are block-scoped, var is function-scoped; const cannot be reassigned",
        "incorrect_answers": [
          "There is no difference",
          "let is faster than const",
          "var is the most modern way"
        ]
      },
      {
        "question": "What is a callback function in JavaScript?",
        "correct_answer": "A function passed as an argument to another function to be executed later",
        "incorrect_answers": [
          "A function that calls itself",
          "A way to return values",
          "A type of variable"
        ]
      }
    ]
  },
  "Python": {
    "category": "Programming",
    "questions": [
      {
        "question": "What is a list comprehension in Python?",
        "correct_answer": "A concise way to create lists based on existing sequences",
        "incorrect_answers": [
          "A way to understand code",
          "A method to sort lists",
          "A type of loop"
        ]
      },
      {
        "question": "What is the difference between a list and a tuple in Python?",
        "correct_answer": "Lists are mutable, tuples are immutable",
        "incorrect_answers": [
          "Lists are faster than tuples",
          "Tuples can only store numbers",
          "There is no difference"
        ]
      },
      {
        "question": "What is a decorator in Python?",
        "correct_answer": "A function that modifies another function",
        "incorrect_answers": [
          "A way to decorate output",
          "A type of variable",
          "A method to format strings"
        ]
      },
      {
        "question": "What is the GIL in Python?",
        "correct_answer": "Global Interpreter Lock that allows only one thread to execute at a time",
        "incorrect_answers": [
          "A type of data structure",
          "A way to import modules",
          "A method to handle errors"
        ]
      },
      {
        "question": "What is the purpose of '__init__' method in Python?",
        "correct_answer": "A constructor method that initializes an object",
        "incorrect_answers": [
          "A way to end a program",
          "A method to print output",
          "A type of function"
        ]
      },
      {
        "question": "What is a generator in Python?",
        "correct_answer": "A function that returns an iterator object with lazy evaluation",
        "incorrect_answers": [
          "A type of class",
          "A way to generate random numbers",
          "A method to create loops"
        ]
      },
      {
        "question": "What is the difference between 'is' and '==' in Python?",
        "correct_answer": "'is' checks identity (same object), '==' checks equality (same value)",
        "incorrect_answers": [
          "There is no difference",
          "'is' is faster than '=='",
          "'==' only works with numbers"
        ]
      },
      {
        "question": "What is a context manager in Python?",
        "correct_answer": "An object that manages the setup and cleanup of resources using 'with' statement",
        "incorrect_answers": [
          "A way to manage variables",
          "A type of function",
          "A method to handle errors"
        ]
      },
      {
        "question": "What is the purpose of 'self' in Python classes?",
        "correct_answer": "A reference to the instance of the class, used to access instance variables and methods",
        "incorrect_answers": [
          "A way to make methods static",
          "A reference to the class itself",
          "A type of variable"
        ]
      },
      {
        "question": "What is duck typing in Python?",
        "correct_answer": "A programming concept where the type of an object is determined by its behavior rather than its class",
        "incorrect_answers": [
          "A way to create ducks in code",
          "A type checking method",
          "A debugging technique"
        ]
      }
    ]
  },
  "React": {
    "category": "Programming",
    "questions": [
      {
        "question": "What is JSX in React?",
        "correct_answer": "A syntax extension for JavaScript that allows writing HTML-like code",
        "incorrect_answers": [
          "A JavaScript framework",
          "A type of CSS",
          "A database technology"
        ]
      },
      {
        "question": "What is the difference between state and props in React?",
        "correct_answer": "State is internal and mutable, props are external and immutable",
        "incorrect_answers": [
          "State is faster than props",
          "Props can only be strings",
          "There is no difference"
        ]
      },
      {
        "question": "What is a hook in React?",
        "correct_answer": "A function that allows you to use state and other React features in functional components",
        "incorrect_answers": [
          "A way to connect to databases",
          "A type of event listener",
          "A method to style components"
        ]
      },
      {
        "question": "What is the virtual DOM in React?",
        "correct_answer": "A lightweight copy of the actual DOM that React uses for comparison",
        "incorrect_answers": [
          "A type of database",
          "A way to create animations",
          "A method to handle forms"
        ]
      },
      {
        "question": "What is the purpose of useEffect hook?",
        "correct_answer": "To perform side effects in functional components",
        "incorrect_answers": [
          "To create effects in CSS",
          "To handle user events",
          "To manage component state"
        ]
      }
    ]
  },
  "Node.js": {
    "category": "Programming",
    "questions": [
      {
        "question": "What is the event loop in Node.js?",
        "correct_answer": "A mechanism that allows Node.js to perform non-blocking I/O operations",
        "incorrect_answers": [
          "A way to create loops in code",
          "A type of database",
          "A method to handle errors"
        ]
      },
      {
        "question": "What is the difference between require() and import in Node.js?",
        "correct_answer": "require() is CommonJS syntax, import is ES6 module syntax",
        "incorrect_answers": [
          "require() is faster than import",
          "import only works with JSON files",
          "There is no difference"
        ]
      },
      {
        "question": "What is middleware in Express.js?",
        "correct_answer": "Functions that have access to request and response objects",
        "incorrect_answers": [
          "A type of database",
          "A way to style web pages",
          "A method to handle authentication"
        ]
      },
      {
        "question": "What is the purpose of package.json in Node.js?",
        "correct_answer": "A file that contains project metadata and dependencies",
        "incorrect_answers": [
          "A way to package applications",
          "A type of configuration file",
          "A method to run tests"
        ]
      },
      {
        "question": "What is the difference between synchronous and asynchronous functions in Node.js?",
        "correct_answer": "Synchronous functions block execution, asynchronous functions don't",
        "incorrect_answers": [
          "Synchronous functions are faster",
          "Asynchronous functions only work with databases",
          "There is no difference"
        ]
      },
      {
        "question": "What is a callback hell in Node.js?",
        "correct_answer": "A situation where callbacks are nested within callbacks, making code hard to read",
        "incorrect_answers": [
          "A type of error handling",
          "A way to organize code",
          "A debugging technique"
        ]
      },
      {
        "question": "What is the purpose of process.nextTick() in Node.js?",
        "correct_answer": "To defer the execution of a function until the next iteration of the event loop",
        "incorrect_answers": [
          "To make code run faster",
          "To create new processes",
          "To handle errors"
        ]
      },
      {
        "question": "What is a stream in Node.js?",
        "correct_answer": "An abstract interface for working with streaming data in Node.js",
        "incorrect_answers": [
          "A type of database",
          "A way to create loops",
          "A method to handle HTTP requests"
        ]
      },
      {
        "question": "What is the difference between process.exit() and process.kill() in Node.js?",
        "correct_answer": "process.exit() terminates the process gracefully, process.kill() forces termination",
        "incorrect_answers": [
          "There is no difference",
          "process.kill() is safer",
          "process.exit() is faster"
        ]
      },
      {
        "question": "What is a buffer in Node.js?",
        "correct_answer": "A class to handle raw binary data",
        "incorrect_answers": [
          "A way to store strings",
          "A type of database",
          "A method to handle errors"
        ]
      }
    ]
  },
  "Java": {
    "category": "Programming",
    "questions": [
      {
        "question": "What is the difference between == and .equals() in Java?",
        "correct_answer": "== compares object references, .equals() compares object content",
        "incorrect_answers": [
          "There is no difference",
          "== is faster than .equals()",
          ".equals() only works with strings"
        ]
      },
      {
        "question": "What is the purpose of 'final' keyword in Java?",
        "correct_answer": "To make variables, methods, or classes immutable or non-overridable",
        "incorrect_answers": [
          "To make code run faster",
          "To create constants",
          "To end a program"
        ]
      },
      {
        "question": "What is garbage collection in Java?",
        "correct_answer": "Automatic memory management that removes unused objects",
        "incorrect_answers": [
          "A way to collect data",
          "A type of loop",
          "A debugging tool"
        ]
      },
      {
        "question": "What is the difference between ArrayList and LinkedList in Java?",
        "correct_answer": "ArrayList is better for random access, LinkedList is better for insertions/deletions",
        "incorrect_answers": [
          "There is no difference",
          "ArrayList is always faster",
          "LinkedList uses less memory"
        ]
      },
      {
        "question": "What is a thread in Java?",
        "correct_answer": "A lightweight sub-process that can run concurrently with other threads",
        "incorrect_answers": [
          "A type of variable",
          "A way to handle errors",
          "A method to create objects"
        ]
      },
      {
        "question": "What is the purpose of 'static' keyword in Java?",
        "correct_answer": "To create class-level members that belong to the class, not instances",
        "incorrect_answers": [
          "To make variables constant",
          "To improve performance",
          "To create global variables"
        ]
      },
      {
        "question": "What is polymorphism in Java?",
        "correct_answer": "The ability of different objects to respond to the same method call in different ways",
        "incorrect_answers": [
          "A way to create multiple classes",
          "A type of variable",
          "A method to handle errors"
        ]
      },
      {
        "question": "What is the difference between checked and unchecked exceptions in Java?",
        "correct_answer": "Checked exceptions must be handled, unchecked exceptions don't require handling",
        "incorrect_answers": [
          "There is no difference",
          "Checked exceptions are faster",
          "Unchecked exceptions are safer"
        ]
      },
      {
        "question": "What is a constructor in Java?",
        "correct_answer": "A special method that initializes an object when it is created",
        "incorrect_answers": [
          "A way to destroy objects",
          "A type of variable",
          "A method to handle errors"
        ]
      },
      {
        "question": "What is the purpose of 'interface' in Java?",
        "correct_answer": "To define a contract that classes must implement",
        "incorrect_answers": [
          "To create objects",
          "A way to handle errors",
          "A type of variable"
        ]
      }
    ]
  },
  "SQL": {
    "category": "Database",
    "questions": [
      {
        "question": "What is the difference between INNER JOIN and LEFT JOIN?",
        "correct_answer": "INNER JOIN returns only matching records, LEFT JOIN returns all records from left table",
        "incorrect_answers": [
          "There is no difference",
          "INNER JOIN is faster",
          "LEFT JOIN only works with two tables"
        ]
      },
      {
        "question": "What is a primary key in SQL?",
        "correct_answer": "A column or set of columns that uniquely identifies each row in a table",
        "incorrect_answers": [
          "A way to sort data",
          "A type of index",
          "A foreign key reference"
        ]
      },
      {
        "question": "What is the purpose of GROUP BY in SQL?",
        "correct_answer": "To group rows that have the same values in specified columns",
        "incorrect_answers": [
          "To sort data",
          "To filter data",
          "To join tables"
        ]
      },
      {
        "question": "What is the difference between WHERE and HAVING in SQL?",
        "correct_answer": "WHERE filters individual rows, HAVING filters grouped rows",
        "incorrect_answers": [
          "There is no difference",
          "WHERE is faster than HAVING",
          "HAVING only works with numbers"
        ]
      },
      {
        "question": "What is a foreign key in SQL?",
        "correct_answer": "A column that creates a link between two tables",
        "incorrect_answers": [
          "A way to sort data",
          "A type of index",
          "A primary key"
        ]
      },
      {
        "question": "What is the purpose of INDEX in SQL?",
        "correct_answer": "To improve the speed of data retrieval operations",
        "incorrect_answers": [
          "To store data",
          "To create relationships",
          "To validate data"
        ]
      },
      {
        "question": "What is normalization in SQL?",
        "correct_answer": "The process of organizing data to reduce redundancy and improve data integrity",
        "incorrect_answers": [
          "A way to sort data",
          "A type of join",
          "A method to backup data"
        ]
      },
      {
        "question": "What is the difference between DELETE and TRUNCATE in SQL?",
        "correct_answer": "DELETE removes specific rows, TRUNCATE removes all rows and resets auto-increment",
        "incorrect_answers": [
          "There is no difference",
          "DELETE is faster",
          "TRUNCATE is safer"
        ]
      },
      {
        "question": "What is a stored procedure in SQL?",
        "correct_answer": "A prepared SQL code that can be saved and reused",
        "incorrect_answers": [
          "A type of table",
          "A way to backup data",
          "A method to create indexes"
        ]
      },
      {
        "question": "What is the purpose of COMMIT and ROLLBACK in SQL?",
        "correct_answer": "COMMIT saves changes permanently, ROLLBACK undoes changes",
        "incorrect_answers": [
          "To create tables",
          "To delete data",
          "To sort data"
        ]
      }
    ]
  },
  "MongoDB": {
    "category": "Database",
    "questions": [
      {
        "question": "What is a document in MongoDB?",
        "correct_answer": "A JSON-like data structure that stores data",
        "incorrect_answers": [
          "A text file",
          "A database table",
          "A programming language"
        ]
      },
      {
        "question": "What is the difference between MongoDB and SQL databases?",
        "correct_answer": "MongoDB is document-based and schema-less, SQL databases are table-based with schemas",
        "incorrect_answers": [
          "There is no difference",
          "MongoDB is faster",
          "SQL databases are more modern"
        ]
      },
      {
        "question": "What is an aggregation pipeline in MongoDB?",
        "correct_answer": "A framework for data processing that transforms documents into aggregated results",
        "incorrect_answers": [
          "A way to create indexes",
          "A type of query",
          "A method to backup data"
        ]
      },
      {
        "question": "What is the purpose of indexes in MongoDB?",
        "correct_answer": "To improve query performance by creating data structures for efficient data retrieval",
        "incorrect_answers": [
          "To store data",
          "To create relationships",
          "To validate data"
        ]
      },
      {
        "question": "What is a replica set in MongoDB?",
        "correct_answer": "A group of mongod processes that maintain the same data set",
        "incorrect_answers": [
          "A type of database",
          "A way to backup data",
          "A method to create indexes"
        ]
      },
      {
        "question": "What is the difference between find() and findOne() in MongoDB?",
        "correct_answer": "find() returns a cursor with multiple documents, findOne() returns a single document",
        "incorrect_answers": [
          "There is no difference",
          "find() is faster",
          "findOne() only works with numbers"
        ]
      },
      {
        "question": "What is sharding in MongoDB?",
        "correct_answer": "A method for distributing data across multiple machines",
        "incorrect_answers": [
          "A way to backup data",
          "A type of index",
          "A method to create relationships"
        ]
      },
      {
        "question": "What is the purpose of ObjectId in MongoDB?",
        "correct_answer": "A unique identifier automatically generated for each document",
        "incorrect_answers": [
          "A way to sort data",
          "A type of index",
          "A method to validate data"
        ]
      },
      {
        "question": "What is a collection in MongoDB?",
        "correct_answer": "A group of documents stored in a database",
        "incorrect_answers": [
          "A type of index",
          "A way to backup data",
          "A method to create relationships"
        ]
      },
      {
        "question": "What is the difference between update() and updateOne() in MongoDB?",
        "correct_answer": "update() can modify multiple documents, updateOne() modifies only the first match",
        "incorrect_answers": [
          "There is no difference",
          "update() is faster",
          "updateOne() is deprecated"
        ]
      }
    ]
  },
  "Docker": {
    "category": "DevOps",
    "questions": [
      {
        "question": "What is a Docker container?",
        "correct_answer": "A lightweight, standalone package that includes everything needed to run an application",
        "incorrect_answers": [
          "A type of database",
          "A programming language",
          "A web server"
        ]
      },
      {
        "question": "What is the difference between a container and a virtual machine?",
        "correct_answer": "Containers share the host OS kernel, VMs have their own OS",
        "incorrect_answers": [
          "There is no difference",
          "Containers are slower",
          "VMs use less resources"
        ]
      },
      {
        "question": "What is a Docker image?",
        "correct_answer": "A read-only template used to create containers",
        "incorrect_answers": [
          "A type of container",
          "A way to backup data",
          "A programming language"
        ]
      },
      {
        "question": "What is the purpose of Dockerfile?",
        "correct_answer": "A text file with instructions to build a Docker image",
        "incorrect_answers": [
          "A way to run containers",
          "A type of image",
          "A method to backup data"
        ]
      },
      {
        "question": "What is Docker Compose?",
        "correct_answer": "A tool for defining and running multi-container Docker applications",
        "incorrect_answers": [
          "A type of container",
          "A way to backup images",
          "A programming language"
        ]
      },
      {
        "question": "What is the difference between docker run and docker start?",
        "correct_answer": "docker run creates and starts a new container, docker start starts an existing stopped container",
        "incorrect_answers": [
          "There is no difference",
          "docker run is faster",
          "docker start is deprecated"
        ]
      },
      {
        "question": "What is a Docker volume?",
        "correct_answer": "A mechanism for persisting data generated by and used by Docker containers",
        "incorrect_answers": [
          "A type of image",
          "A way to backup containers",
          "A programming language"
        ]
      },
      {
        "question": "What is the purpose of docker exec?",
        "correct_answer": "To run a command in a running container",
        "incorrect_answers": [
          "To create containers",
          "To backup images",
          "To stop containers"
        ]
      },
      {
        "question": "What is Docker Hub?",
        "correct_answer": "A cloud-based registry service for sharing Docker images",
        "incorrect_answers": [
          "A type of container",
          "A way to backup data",
          "A programming language"
        ]
      },
      {
        "question": "What is the difference between docker build and docker pull?",
        "correct_answer": "docker build creates an image from a Dockerfile, docker pull downloads an image from a registry",
        "incorrect_answers": [
          "There is no difference",
          "docker build is faster",
          "docker pull is deprecated"
        ]
      }
    ]
  },
  "Git": {
    "category": "DevOps",
    "questions": [
      {
        "question": "What is the difference between git pull and git fetch?",
        "correct_answer": "git pull downloads and merges changes, git fetch only downloads changes",
        "incorrect_answers": [
          "There is no difference",
          "git fetch is faster",
          "git pull is deprecated"
        ]
      },
      {
        "question": "What is a git branch?",
        "correct_answer": "A separate line of development that allows you to work on features independently",
        "incorrect_answers": [
          "A way to backup code",
          "A type of commit",
          "A programming language"
        ]
      },
      {
        "question": "What is the purpose of git merge?",
        "correct_answer": "To combine changes from different branches into one branch",
        "incorrect_answers": [
          "To create branches",
          "To backup code",
          "To delete files"
        ]
      },
      {
        "question": "What is a git commit?",
        "correct_answer": "A snapshot of your code at a specific point in time",
        "incorrect_answers": [
          "A type of branch",
          "A way to backup data",
          "A programming language"
        ]
      },
      {
        "question": "What is the difference between git reset and git revert?",
        "correct_answer": "git reset moves the branch pointer, git revert creates a new commit that undoes changes",
        "incorrect_answers": [
          "There is no difference",
          "git reset is safer",
          "git revert is faster"
        ]
      },
      {
        "question": "What is a git remote?",
        "correct_answer": "A repository stored on another server that you can connect to",
        "incorrect_answers": [
          "A type of branch",
          "A way to backup code",
          "A programming language"
        ]
      },
      {
        "question": "What is the purpose of .gitignore?",
        "correct_answer": "To specify files and directories that should be ignored by Git",
        "incorrect_answers": [
          "To create branches",
          "To backup code",
          "To merge changes"
        ]
      },
      {
        "question": "What is a git stash?",
        "correct_answer": "A temporary storage area for uncommitted changes",
        "incorrect_answers": [
          "A type of branch",
          "A way to backup code",
          "A programming language"
        ]
      },
      {
        "question": "What is the difference between git clone and git fork?",
        "correct_answer": "git clone downloads a repository, git fork creates a copy on a remote server",
        "incorrect_answers": [
          "There is no difference",
          "git clone is faster",
          "git fork is deprecated"
        ]
      },
      {
        "question": "What is a git tag?",
        "correct_answer": "A reference that points to a specific commit, often used for releases",
        "incorrect_answers": [
          "A type of branch",
          "A way to backup code",
          "A programming language"
        ]
      }
    ]
  },
  "AWS": {
    "category": "Cloud",
    "questions": [
      {
        "question": "What is EC2 in AWS?",
        "correct_answer": "Elastic Compute Cloud - a web service that provides resizable compute capacity",
        "incorrect_answers": [
          "A type of database",
          "A programming language",
          "A web server"
        ]
      },
      {
        "question": "What is the difference between S3 and EBS in AWS?",
        "correct_answer": "S3 is object storage for files, EBS is block storage for EC2 instances",
        "incorrect_answers": [
          "There is no difference",
          "S3 is faster",
          "EBS is cheaper"
        ]
      },
      {
        "question": "What is Lambda in AWS?",
        "correct_answer": "A serverless compute service that runs code in response to events",
        "incorrect_answers": [
          "A type of database",
          "A programming language",
          "A web server"
        ]
      },
      {
        "question": "What is the purpose of VPC in AWS?",
        "correct_answer": "Virtual Private Cloud - to create isolated network environments",
        "incorrect_answers": [
          "To store data",
          "To run applications",
          "To backup files"
        ]
      },
      {
        "question": "What is the difference between RDS and DynamoDB in AWS?",
        "correct_answer": "RDS is relational database service, DynamoDB is NoSQL database service",
        "incorrect_answers": [
          "There is no difference",
          "RDS is faster",
          "DynamoDB is cheaper"
        ]
      },
      {
        "question": "What is CloudFormation in AWS?",
        "correct_answer": "A service for creating and managing AWS infrastructure as code",
        "incorrect_answers": [
          "A type of database",
          "A programming language",
          "A web server"
        ]
      },
      {
        "question": "What is the purpose of IAM in AWS?",
        "correct_answer": "Identity and Access Management - to control access to AWS resources",
        "incorrect_answers": [
          "To store data",
          "To run applications",
          "To backup files"
        ]
      },
      {
        "question": "What is the difference between CloudWatch and CloudTrail in AWS?",
        "correct_answer": "CloudWatch monitors resources and applications, CloudTrail logs API calls",
        "incorrect_answers": [
          "There is no difference",
          "CloudWatch is faster",
          "CloudTrail is cheaper"
        ]
      },
      {
        "question": "What is SQS in AWS?",
        "correct_answer": "Simple Queue Service - a fully managed message queuing service",
        "incorrect_answers": [
          "A type of database",
          "A programming language",
          "A web server"
        ]
      },
      {
        "question": "What is the purpose of Route 53 in AWS?",
        "correct_answer": "A scalable Domain Name System web service for routing end users to applications",
        "incorrect_answers": [
          "To store data",
          "To run applications",
          "To backup files"
        ]
      }
    ]
  },
  "Machine Learning": {
    "category": "Technical",
    "questions": [
      {
        "question": "What is the difference between supervised and unsupervised learning?",
        "correct_answer": "Supervised learning uses labeled data, unsupervised learning finds patterns in unlabeled data",
        "incorrect_answers": [
          "There is no difference",
          "Supervised learning is faster",
          "Unsupervised learning is more accurate"
        ]
      },
      {
        "question": "What is overfitting in machine learning?",
        "correct_answer": "When a model learns the training data too well and performs poorly on new data",
        "incorrect_answers": [
          "When a model is too simple",
          "When training takes too long",
          "When data is missing"
        ]
      },
      {
        "question": "What is cross-validation in machine learning?",
        "correct_answer": "A technique to assess how well a model will generalize to new data",
        "incorrect_answers": [
          "A way to train models faster",
          "A type of algorithm",
          "A method to collect data"
        ]
      },
      {
        "question": "What is the difference between classification and regression?",
        "correct_answer": "Classification predicts categories, regression predicts continuous values",
        "incorrect_answers": [
          "There is no difference",
          "Classification is faster",
          "Regression is more accurate"
        ]
      },
      {
        "question": "What is feature engineering in machine learning?",
        "correct_answer": "The process of creating new features from existing data to improve model performance",
        "incorrect_answers": [
          "A way to train models faster",
          "A type of algorithm",
          "A method to collect data"
        ]
      },
      {
        "question": "What is the purpose of regularization in machine learning?",
        "correct_answer": "To prevent overfitting by adding constraints to the model",
        "incorrect_answers": [
          "To make models faster",
          "To collect more data",
          "To improve accuracy"
        ]
      },
      {
        "question": "What is the difference between precision and recall?",
        "correct_answer": "Precision measures accuracy of positive predictions, recall measures ability to find all positives",
        "incorrect_answers": [
          "There is no difference",
          "Precision is always higher",
          "Recall is more important"
        ]
      },
      {
        "question": "What is a neural network in machine learning?",
        "correct_answer": "A computational model inspired by biological neural networks",
        "incorrect_answers": [
          "A type of database",
          "A programming language",
          "A web server"
        ]
      },
      {
        "question": "What is the purpose of gradient descent in machine learning?",
        "correct_answer": "An optimization algorithm to minimize the cost function",
        "incorrect_answers": [
          "To collect data",
          "To visualize results",
          "To deploy models"
        ]
      },
      {
        "question": "What is the difference between training and testing data?",
        "correct_answer": "Training data is used to build the model, testing data is used to evaluate performance",
        "incorrect_answers": [
          "There is no difference",
          "Training data is larger",
          "Testing data is more important"
        ]
      }
    ]
  }
};

// Function to generate training data
function generateTrainingData() {
  const trainingData = [];
  
  Object.keys(skillQuestionsData).forEach(skillName => {
    const skillData = skillQuestionsData[skillName];
    
    skillData.questions.forEach(questionData => {
      const trainingExample = {
        skill: skillName,
        category: skillData.category,
        proficiency: "Intermediate", // You can vary this based on your needs
        questions: [questionData]
      };
      
      trainingData.push(trainingExample);
    });
  });
  
  return trainingData;
}

// Function to save training data to file
function saveTrainingData(data, filename = 'training_data.json') {
  const filePath = path.join(__dirname, '..', 'data', filename);
  
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(filePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Training data saved to ${filePath}`);
}

// Function to generate more diverse training data
function generateExtendedTrainingData() {
  const extendedData = [];
  
  // Use all skills from skillQuestionsData
  Object.keys(skillQuestionsData).forEach(skillName => {
    const skillData = skillQuestionsData[skillName];
    
    skillData.questions.forEach(questionData => {
      // Generate multiple proficiency levels
      const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];
      
      proficiencyLevels.forEach(proficiency => {
        const trainingExample = {
          skill: skillName,
          category: skillData.category,
          proficiency: proficiency,
          questions: [questionData]
        };
        
        extendedData.push(trainingExample);
      });
    });
  });
  
  return extendedData;
}

module.exports = {
  generateTrainingData,
  saveTrainingData,
  generateExtendedTrainingData,
  skillQuestionsData
};
