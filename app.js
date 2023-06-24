const states = [
  'AL',
  'AK',
  'AS',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FM',
  'FL',
  'GA',
  'GU',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MH',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'MP',
  'OH',
  'OK',
  'OR',
  'PW',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VI',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

const chartCache = {}

const covid_data_url = 'https://data.cdc.gov/resource/kn79-hsxy.json'
let CASE_DATA = ''

const selector = document.getElementById( 'state-dropdown' )

const chartConf = {
  defineName: () => Date.now().toString(),
  type: 'bar',
  label: 'Covid Deaths',
}

states.forEach( ( ind ) => {
  const option = document.createElement( 'option' )
  const optionText = document.createTextNode( `${ind}` )
  option.appendChild( optionText )
  selector.appendChild( option )
} )

const button = document.getElementById( 'generate' )
button.addEventListener( 'click', async () => {
  try {
    const resData = await fetch( covid_data_url )
    createChart( await resData.json() )
  } catch ( error ) {
    alert( error )
  }
} )

function randomRGBA() {
  const x = Math.floor( Math.random() * 256 )
  const y = Math.floor( Math.random() * 256 )
  const z = Math.floor( Math.random() * 256 )
  return 'rgba(' + x + ',' + y + ',' + z + ',' + 0.4 + ')'
}

function datasetBuilder( d ) {
  return [
    {
      label: chartConf.label,
      data: d.map( ( { covid_death } ) => covid_death ),
      backgroundColor: d.forEach( randomRGBA ),
      borderColor: 'black',
      borderWidth: 1,
    },
  ]
}

const opts = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    }
  },
}

function createChart( data ) {
  const spanDateAsOf = document.getElementById( 'weekOf' )
  let start_date = new Date( data[0].start_week ).toString().slice( 0, 15 )
  let end_date = new Date( data[0].end_week ).toString().slice( 0, 15 )
  spanDateAsOf.textContent = `Start Date: ${start_date}      End Date: ${end_date}`

  const selectedState = document.getElementById( 'state-dropdown' )
  const stateSelected = selectedState.options[selectedState.selectedIndex].text

  let countiesInState = data.filter( ( state ) => state.state_name === stateSelected )

  if ( countiesInState.length < 1 ) {
    alert( 'No data to show for this state' )
    return
  } else {

    const chartName = chartConf.defineName()

    const chartContainer = document.getElementById( 'chart-container' )

    const newCanvas = document.createElement( 'canvas' )
    newCanvas.setAttribute( 'id', chartName )

    chartContainer.appendChild( newCanvas )

    let ctx = document.getElementById( chartName ).getContext( '2d' )

    new Chart( ctx, {
      type: chartConf.type,
      data: {
        labels: countiesInState.map( ( { county_name } ) => county_name ),
        datasets: datasetBuilder( countiesInState ),
      },
      options: opts,
    } )
  }
}
