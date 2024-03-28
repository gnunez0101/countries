import { useEffect, useRef, useState } from 'react'
import { IoMoonOutline } from "react-icons/io5"
import { IoMoon }        from "react-icons/io5"
import { IoMdSearch }    from "react-icons/io"
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import Select from 'react-select'
import './App.css'

function App() {

  const html = document.getElementsByTagName('html')
  const urlCountries = 'https://restcountries.com/v3.1/all'

  const [countries, setCountries] = useState<any>()
  const [countriesCopy, setCountriesCopy] = useState<any>()
  const [darkMode, setDarkMode] = useState(true)
  const [userInput, setUserInput] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<any>()

  const inputValue = useRef<any>(null)
  const windowSize = useRef(0);

  useEffect(() => {
    const compareNames = (a: any, b:any) => {
      if (a.name.common > b.name.common) return  1
      if (a.name.common < b.name.common) return -1
      return 0    
    }
    fetch(urlCountries)
      .then(response => response.json())
      .then(data     => {
        const newData = data.toSorted(compareNames)
        setCountries(newData)
        setCountriesCopy(newData)
      })
      .catch(error   => console.error(error))
    setDarkMode(localStorage.getItem("dark-mode") === "enabled");  // Check and set dark mode
    const handleResize = () => { windowSize.current = window.innerWidth }
    windowSize.current = window.innerWidth;
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    localStorage.setItem("dark-mode", darkMode ? "enabled" : "disabled");
  }, [darkMode]);

  useEffect(() => {
    if (countriesCopy) {
      const searchString = userInput.toLowerCase()
      const filteredCountries = countries.filter((country: any) => country.name.common.toLowerCase().includes(searchString))
      setCountriesCopy(filteredCountries)
    }
  }, [userInput])

  useEffect(() => {
    // Switch font size depending on page:
    html[0].style.fontSize = selectedCountry ? '16px' : '14px'
  }, [selectedCountry])

  const Country = ({country} : {country:any}) => {
    const formattedPopulation = country.population.toLocaleString('en-US')
    return (
      <div className="country-box" onClick={() => { setSelectedCountry(country) }}>
        <section className="flag">
          <img src={country.flags.png} alt="flag" />
        </section>
        <section className="data">
          <div className="name">      {country.name.common}</div>
          <div className="population"><span>Population: </span>{formattedPopulation}</div>
          <div className="region">    <span>Region: </span>    {country.region}</div>
          <div className="capital">   <span>Capital: </span>   {country.capital}</div>
        </section>
      </div>
    )
  }

  function Detail({country} : {country:any}) {
    // Extracting Native Name. If no native name, Common is used:
    let nativeName = ''
    if (country.name.nativeName) {
      const objNativeName = country.name.nativeName
      nativeName = objNativeName[Object.keys(objNativeName)[0]].common
    }
    else { nativeName = country.name.common }
    // Formatting population number:
    const formattedPopulation = country.population.toLocaleString('en-US')
    // Extracting Sub Region, if any:
    const subRegion = country.subregion ? country.subregion : 'No Subregion.'
    // Extracting Capital, if any:
    let capital = country.capital ? country.capital : 'No Capital.'
    // Extracting currency names from nested object, if any:
    let currencies = 'No currencies.'
    if (country.currencies) {
      const currencyNames = Object.keys(country.currencies)  // Extracting keys
      currencies = currencyNames.map(currency => country.currencies[currency].name).join(', ')
    }
    // Extracting language names, if any:
    let languages = 'No languages.'
    if (country.languages) {
      const languagesNames = Object.keys(country.languages)
      languages = languagesNames.map(language => country.languages[language]).sort().join(', ')
    }
    // Extracting border countries, if any:
    let countryBorders: any = []   // Empty array to store names
    if (country.borders) {
      country.borders.map((border: string) => {
          const found = countries.find(({cca3}:{cca3: string}) => (cca3 == border))  // Finding common name with cca3 code
          countryBorders.push({ "name" : found.name.common, "code" : found.cca3 })   // Adding found name to array
        }
      )
    }

    const handleBorder = (code: string) => {
      const found = countries.find(({cca3}:{cca3: string}) => (cca3 == code))  // Finding common name with cca3 code
      setSelectedCountry(found)
    }

    return <article className="detail">
      <section className="back">
        <button onClick={() => setSelectedCountry(null)}><MdOutlineKeyboardBackspace />Back</button>
      </section>
      <section className="country-details">
        <div className="details-flag"><img src={country.flags.png} alt="flag" /></div>
        <div className="details-data">
          <div className="details-name">{selectedCountry.name.common}</div>
          <div className="details-main-data">
            <div className="details-one">
              <div className="native-name"><span>Native Name: </span>{nativeName}</div>
              <div className="population"> <span>Population: </span> {formattedPopulation}</div>
              <div className="region">     <span>Region: </span>     {country.region}</div>
              <div className="subregion">  <span>Sub Region: </span> {subRegion}</div>
              <div className="capital">    <span>Capital: </span>    {capital}</div>
            </div>
            <div className="details-two">
              <div className="tld"><span>Top Level Domain: </span> {country.tld}</div>
              <div className="currencies"><span>Currencies: </span>{currencies}</div>
              <div className="languages"><span>Languages: </span>{languages}</div>
            </div>
          </div>
          { country.borders &&
            <div className="details-borders">
              <div className="borders-title">Border Countries:</div>
              <div className="borders-list">
                { countryBorders.map( (countryBorder: any, index: number) => 
                    <button 
                      className={`border-name ${countryBorder.name.length > 12 ? "long" : ""}`}
                      type='button' key={index}
                      onClick={() => handleBorder(countryBorder.code)}>
                      { countryBorder.name }
                    </button>
                )}
              </div>
            </div>
          }
        </div>
      </section>
    </article>
  }

  let theme = darkMode ? "dark-mode" : "light-mode";

  const regions = [
    { value: 'africa',   label: 'Africa' },
    { value: 'americas', label: 'Americas' },
    { value: 'asia',     label: 'Asia' },
    { value: 'europe',   label: 'Europe' },
    { value: 'oceania',  label: 'Oceania' },
  ]

  const handleRegion = (region: any) => {
    const filteredCountries = countries.filter((country: any) => region.label == country.region)
    setCountriesCopy(filteredCountries)
    inputValue.current.value = ""
  }

  return (
    <main className={theme}>

      <header className={`header${selectedCountry ? '-detail' : ''}`}>
        <h1 className="title">Where in the World?</h1>
        <section className="dark-toggle"
          onClick={() => {setDarkMode(!darkMode)}}>
          {darkMode ? <IoMoon/> : <IoMoonOutline/>}<span>Dark Mode</span>
        </section>
      </header>
      
      { !selectedCountry &&
        <div className='dashboard'>
          <article className="filters">
            <div className="search">
              <span className='loupe'><IoMdSearch /></span>
              <input type="text" aria-label='Search'
                placeholder='Search for a country...'
                onChange={(e) => setUserInput(e.target.value)}
                ref={inputValue}
              />
            </div>
            <Select options={regions} placeholder={'Filter by Region'}
              onChange={handleRegion}
              className='region-select-container' 
              classNamePrefix='region-select'
              aria-label='Select Region'
            />
          </article>
          <article className='countries'>
            { countriesCopy ? countriesCopy.length > 0 ?
              countriesCopy.map((country: any, index: number) => 
                <Country key = {index} country = {country} />
              )  : <div className='not-found'>
                    {`Sorry! no countries matched with "${inputValue.current.value}"`}
                  </div>
              : <div className='loading'>Loading countries...</div>
            }
          </article>
        </div>
      }

      { selectedCountry && <Detail country={selectedCountry} /> }

      <div className="attribution">
        Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend Mentor</a>. 
        Coded by <a href="https://linkedin.com/in/gnunez0101"> Gonzalo M. Núñez</a>.
      </div>
      
    </main>
  )
}

export default App
