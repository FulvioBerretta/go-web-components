## The Application Goal

The Goal here is to provide the user an application to discuss movie meaning, and finally understand
(where possible) movies with obscure meaning. 
If possible a function to ask the name of the movie based on the plot will be provided as well.

## Design principles

The main design principle is simplicity.
Various options were evaluated in the beginning.
A lot of solutions for both front-end and back-end 
are indeed powerful but comes with significant overhead.

### Front End

Front-end libraries and framework requires you to manage
dependencies with the package.json. If you want to introduce
type-safety then you'll introduce typescript.
You'll need a separate framework, and you'll need a bundler.
Then something bad in configurations typically occurs
and development is slowdown.
I decided to sacrificed customizability in favor
of simplicity and terseness. 
I still wanted a separation from front-end and back-end,
and I didn't like the idea of generating HTML server-side
and using templating libraries like Jinja.
I noticed that the Back-end APIs were simpler without the
need to generate templates, and just returning simple JSON
responses.
I opted for alpineJS, that allowed me to reuse HTML and enhancing it
with just a few words pf syntax.
The experience has been pleasant with no issues at all.
For the styling I use a simple CSS library called PicoCSS.

#### Javascript with Flow 
Instead of introducing the burden of having a transpiler I
opted for Javascript's version called Flow.

"Flow adds static typing to JavaScript to improve developer productivity and code quality."
( source. https://engineering.fb.com/2014/11/18/web/flow-a-new-static-type-checker-for-javascript/)

#### Web Components
I adopted web components when I realized I don't wanted to copy-paste
too much HTML around. I could've opted for a templating solution like Jinja2,
but I just don't like the feeling of templating and I wanted to have
Front-End separate from Back-End. 
So I discovered the existence of Web Components and it seemed a perfect choice.
I avoided Lit because of custom annotation and I think it could've be a 
useless overhead for my scope here.

### Back End

The Back-End has been built with fastAPI.
I didn't know much about frameworks other than Spring, but I 
decided to opt for a python framework because I liked 
the simplicity and development speed i experienced with Flask
during the course psets.
After FastAPI I realized that I wanted something minimal and 
no external dependencies; so I opted for Bottle that is very minimal
and can be stored in a simple file. Very cool;
However I stii need to use python and have the interpreter 
as a dependency whereas Go comes with a net/http library
that includes a web server right on the spot.

### Database

Initially I thought that I would use something like PostgreSQL.
But then I realized that it would have been a lot of struggle to only
set up the database server, creating users and so on.
Since I learned about the file-based nature of SQLite I wanted to use 
something like that, but I wanted to use something even more simpler.
TinyDB allows me to interact even more freely with the DB, and the 
structure of JSON makes it even easier to interact with it from the code,
and returning directly the fetched Object from the DB.
This might come at the cost of added security risks, risks of inconsistent data,
risk of validation that is built-in with SQL, and so on.
I think it still holds well for prototyping fast applications.
I opted for TinyDB, but that can be changed eventually with SQLITE
whenever userbase grows above 5/10 people.

## AI usage

Gemini has been used mainly to understand concepts and
in the process of trying to resolve issues.
Ai has been used also for weighting the different approaches 
(e.g., SSR vs Single Page Application, HTMX vs AlpineJS, TinyDB vs SQLITE).
With this project the usage has been quite limited because it wasn't able
to provide useful hints given these technologies not being mainstream;
it eventually fell back in suggesting Flask/FastAPI/Django syntax, given
these are the most popular options.
The AI has been used a little for some hints regarding CSS styling.

## Sources

### Web Components
#### https://www.youtube.com/watch?v=2I7uX8m0Ta0
#### https://developer.mozilla.org/en-US/docs/Web/API/Web_components
