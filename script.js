
async function getData() {
    let userInput = document.getElementById("userInput");
    let countryName = userInput.value;
    countryName = countryName.charAt(0).toUpperCase() + countryName.slice(1);
    console.log("countryName: ", countryName);

    Array.from(document.getElementsByClassName("loader")).forEach(element => {
        document.getElementById("temp").innerHTML = '';
        document.getElementById("icon").src = ''
        document.getElementById("windSpeed").innerHTML = '';
        document.getElementById("humidity").innerHTML = '';

        element.style.display = 'block';
    });
    let userData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${countryName}&appid=18a7004f566caf56283e52c1835f0e81`);

    const newData = await userData.json();

    {
        // const newData = data;
        console.log(newData.cod);
        // console.log(data)

        if (newData.cod == 200 && countryName == newData?.name) {
            message.style.display = 'none';
            navbarMain.style.display = 'flex';
            console.log(document.getElementsByClassName("loader"))
            Array.from(document.getElementsByClassName("loader")).forEach(element => {
                element.style.display = 'none';
            });
            // document.getElementById("loader").style.display = 'none';
            document.getElementById("temp").innerHTML = Math.floor(newData.main.temp - 273.15) + "°C";
            let icons = newData.weather[0].icon
            console.log(icons)
            console.log(`https://openweathermap.org/img/wn/${icons}@2x.png`)
            document.getElementById("icon").src = `https://openweathermap.org/img/wn/${icons}@2x.png`
            document.getElementById("windSpeed").innerHTML = Math.round(newData.wind.speed) + " km/h";
            document.getElementById("humidity").innerHTML = newData.main.humidity + "%";

        }

        else {

            navbarMain.style.display = 'none';
            message.style.display = 'block';
            document.getElementById("alert").style.backgroundColor = "sandybrown";
            document.getElementById("alert").style.textAlign = "center";
            document.getElementById("alert").innerHTML = "city not found please enter valid city name";



            document.getElementById("icon").src = "";
            document.getElementById("windSpeed").innerHTML = "";
            document.getElementById("humidity").innerHTML = "";
        }
        if (userInput.value.length == 0) {
            document.getElementById("temp").innerHTML = "";
            document.getElementById("icon").src = "";
            document.getElementById("windSpeed").innerHTML = "";
            document.getElementById("humidity").innerHTML = "";
        }


        return newData;



    }




    if (userInput.value.length > 0) {
        console.log("hi")
        document.getElementById("temp").innerHTML = "";
        document.getElementById("windSpeed").innerHTML = "";
        document.getElementById("humidity").innerHTML = "";
        document.getElementById("icon").src = "";
    }


}
