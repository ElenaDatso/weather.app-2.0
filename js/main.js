//Navigation bar-------------------------------------------------------------------------------------
const searchForm = document.getElementById('search');
const searchInput = document.getElementById('search-input');
const citySpan = document.getElementById('the-city');
const temperatureSpan = document.getElementById('current-temp');
const humidityValue = document.getElementById('humidity');
const windValue = document.getElementById('wind')
const weatherStatusValue = document.getElementById('weather-status');
const currentLocationBtn = document.getElementById('get-location');
const weatherIcon = document.getElementById('weather-icon');
let fetchedCelcium = null;
let calcFarengeit = null;
let latitude = null;
let longitude = null;

const now = new Date();
const dayNum = now.getDay();
const hour = now.getHours();
const minutes = now.getMinutes();
// const date = now.getDate();
// const monthNum = now.getMonth();

const currentWeekDay = document.getElementById('week-day');
const currentHours = document.getElementById('hours');
const currentMinutes = document.getElementById('minutes');
// const currentDate = document.getElementById('date');
// const currentMonth = document.getElementById('month');

const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?';
const apiKey = '4d80f4196b972622c7113645a58d336a';
const metricUnits = 'metric';

// current time---------------------------------------------------------------------------------------

const monthName = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const weekDayName = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

currentWeekDay.innerHTML = weekDayName[dayNum];
currentHours.innerHTML = hour;
currentMinutes.innerHTML = minutes;
// currentDate.innerHTML = date;
// currentMonth.innerHTML = monthName[monthNum];

//City get & display---------------------------------------------------------------------------------------------------

searchForm.addEventListener('submit', displayTheCity);


function startCity (){
    axios
      .get(`${apiUrl}q=${'Kyiv'}&appid=${apiKey}&units=${metricUnits}`)
      .then(displayTheTemperature);

    citySpan.innerHTML = 'Kyiv';
    searchInput.value = '';
   
}

startCity();

function displayTheCity(event) {
    event.preventDefault();
    
  const cityValue = searchInput.value;
  if (cityValue){
      axios
    .get(`${apiUrl}q=${cityValue}&appid=${apiKey}&units=${metricUnits}`)
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        return;
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        return;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        return;
      }
      console.log(error.config);
    })
    .then(displayTheTemperature);
    
    citySpan.innerHTML = searchInput.value;
    searchInput.value = '';
  }  
}

function displayTheTemperature(response) {
  console.log(response);
  latitude = response.data.coord.lat;
  longitude = response.data.coord.lon;

  fetchedCelcium = Math.round(response.data.main.temp);
  calcFarengeit = Math.round(fetchedCelcium * 1.8 + 32);

  temperatureSpan.innerHTML = celciumUnit.classList.contains('current-temperature__units_active')? fetchedCelcium : calcFarengeit;
  humidityValue.innerHTML = `Humidity: ${Math.round(
    response.data.main.humidity
  )}%`;
  windValue.innerHTML = `Wind: ${Math.round(response.data.wind.speed)}km/h`;
  const weatherDescr = (response.data.weather[0].description).toLowerCase();
  weatherStatusValue.innerHTML = `${weatherDescr}`;
  const iconId = response.data.weather[0].icon;
  weatherIcon.setAttribute('src', `/images/${iconId}.svg`);
  weatherIcon.setAttribute('alt', `${weatherDescr}`);
  getWeekForecastData(dayNum, latitude, longitude);
  
}

//API get and display current location-----------------------------------------------------------------------------------+

const apiGetLocationUrl = 'http://api.openweathermap.org/geo/1.0/reverse?';

currentLocationBtn.addEventListener('click', getLocation);

function getLocation(event) {
  event.preventDefault();
  console.log(event);
  navigator.geolocation.getCurrentPosition(fetchDetails);
}

function fetchDetails(position) {
  
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  axios
    .get(`${apiGetLocationUrl}lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`)
    .then(displayCurCity);
}

const displayCurCity = (response) => {
  citySpan.innerHTML = response.data[0].name.split(' ')[0];
  axios
    .get(
      `${apiUrl}q=${
        response.data[0].name.split(' ')[0]
      }&appid=${apiKey}&units=${metricUnits}`
    )
    .then(displayCurTemp);
};

function displayCurTemp(response) {
  temperatureSpan.innerHTML = Math.round(response.data.main.temp);
}

//temperature units switch-------------------------------------------------------------------------------------------------

const celciumUnit = document.getElementById('C');
const farengeitUnit = document.getElementById('F');

celciumUnit.addEventListener('click', displayCelc);
farengeitUnit.addEventListener('click', displayFareng);

function displayCelc(event) {
  event.preventDefault();
  if (celciumUnit.classList.contains('current-temperature__units_active')) {
    
  } else {
    celciumUnit.classList.add('current-temperature__units_active');
    farengeitUnit.classList.remove('current-temperature__units_active');
}
    temperatureSpan.innerHTML = fetchedCelcium;
}

function displayFareng(event) {
  event.preventDefault();
  if (farengeitUnit.classList.contains('current-temperature__units_active')) {
    
  } else {
    farengeitUnit.classList.add('current-temperature__units_active');
    celciumUnit.classList.remove('current-temperature__units_active');
}
    temperatureSpan.innerHTML = calcFarengeit;
}

//Set week forecast --------------------------------------------------------------------------------

const weekForecast = document.getElementById('forecast');
const weekForecastKey = '4d80f4196b972622c7113645a58d336a';

let curDayIndex;


function getWeekForecastData(day, lat, lon) {
  console.log(day, lat, lon);
  curDayIndex = day;
  const weekForecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weekForecastKey}&units=metric`;
  console.table(weekForecastURL);
  axios.get(weekForecastURL).then(createForecastArray)

}

function createForecastArray (response){
    const forecastAr = [];
    for (let item of response.data.list) {

        let prevDay = null;
        let day = dayFormat(item.dt);
        let hours = hoursFormat(item.dt);
        let mins = minsFormat(item.dt);
        let max = item.main.temp_max;
        let min = item.main.temp_min;
        let weather = item.weather[0].description;
        let icon = item.weather[0].icon;
        prevDay = day;
const newDay = new forecastDayData(day, hours, mins, max, min, weather, icon);
forecastAr.push(newDay);
        if (prevDay != day) {
          const newDay = new forecastDayData(day, max, min, weather, icon);
          forecastAr.push(newDay);
        }
    }
    
    buildWeekForecast(forecastAr);
}

class forecastDayData {
    constructor (day, hours, mins, max, min, weather, icon){
        this.day = day;
        this.hours = hours;
        this.mins = mins;
        this.max = max;
        this.min = min;
        this.weather = weather;
        this.icon = icon;
    }
}


function dayFormat (datastamp){
    const date = new Date(datastamp * 1000);
    const day = date.getDay();
    return day;
}

function hoursFormat(datastamp) {
  const date = new Date(datastamp * 1000);
  const hours = date.getHours();
  return hours;
}

function minsFormat(datastamp) {
  const date = new Date(datastamp * 1000);
  const mins = date.getMinutes();
  return mins;
}

  let j = curDayIndex;

function buildWeekForecast(forecastArray) {  

    
    weekForecast.innerHTML = '';  
    let weekForecastItem = document.createElement('div.col-2');
    const days = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    ];


let t = [];

  for (let i = curDayIndex; i <= forecastArray.length-2; i = i+1) {


        if (forecastArray[i].day === forecastArray[i+1].day){
            t.push(forecastArray[i].max);
            t.push(forecastArray[i].min);      
        }
        if (forecastArray[i].day !== forecastArray[i+1].day){
        let sorted = t.sort();
          weekForecastItem = document.createElement('div');
          weekForecastItem.classList.add('col-3');
          weekForecastItem.innerHTML = `<p class="weather-forecast__weekday">${days[forecastArray[i].day]}</p>
                        <p class="weather-forecast__temperature">
                           <span class="weather-forecast__day-temp">${Math.round(
                            sorted[0]
                           )}</span> 
                           <span class="weather-forecast__night-temp">${Math.round(
                            sorted[sorted.length-1]
                           )}</span> 
                        </p>
                        <div class="weather-forecast__weather-icon">
                            <img src="/images/${
                              forecastArray[i].icon
                            }.svg" alt="cloudy">
                        </div>`;

          weekForecast.appendChild(weekForecastItem);
           t = [];  
        }
         
         
        

        }  
  
}

