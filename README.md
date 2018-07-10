# Neighbourhood Map

A responsive web application which uses the Foursquare API and Google Maps API to find interesting places in a neighbourhood and display them on a map.

[Live Demo](https://tlabna.github.io/neighbourhood-map/dist/index.html)

**Note _(as of 2018)_: Ratings, Contact and Website info will display unavailable due to Foursquare API free tier changes**


---

## Dependencies
- Google Maps Javascript API
- Foursquare API
- Bootstrap 3
- [Knockout JS](http://knockoutjs.com/documentation/introduction.html)

###### APIs used

- [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/)
- [Foursquare API](https://developer.foursquare.com/)

---

## Getting Started

**1.** Clone this repo

**2.** Change working directory to `/dist `

**3.** Serve the website locally:

```bash
python -m SimpleHTTPServer 8080     (python2)

python -m http.server 8080          (python3)
```

_Detailed Python Simple Server instructions can been found [here](https://docs.python.org/2/library/basehttpserver.html)._

**4.** Open the website in your browser at ` http://localhost:8080 `

The Neighbourhood Map application should now be running on your web browser.

---
## Using Gulp

Gulp is used for build automation.

**1.** Install packages needed for project:

```bash
npm i
```

**2.** To run, type `$ gulp` to run all automations

## Usage

At the top of the app, there is a form with two input boxes (Area & Find). The default location is **Montreal** as you will see displayed in the **Area** box. To change locations, type in the area box where you'd like to visit (e.g. *Cairo*) and then hit Enter and the app will switch to that area.

The **Find** box allows users to filter for specific places in their current area (Ex. Ice cream stores). Type what you'd like to find and then hit Enter and watch the app find those places for you.

There is a list view box that can be displayed by hitting the **+** sign in the current location box (found underneath the form). This will display all the places you see on the map, you can click on any specific place to quickly zoom into the map marker. You can always hide the list box by clicking on the **-** sign.
