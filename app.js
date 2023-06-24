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

const idTbl = {
  selector: 'state-dropdown',
  button: 'generate',
  chartContainer: 'chart-container',
  chart: 'chart',
  dateSpan: 'weekOf',
  context: '2d',
}

const chartLkp = {}

const covid_data_url = 'https://data.cdc.gov/resource/kn79-hsxy.json'

const selector = document.getElementById( idTbl.selector )

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

document.getElementById( 'generate' ).addEventListener( 'click', async () => {
  try {
    const resData = await fetch( covid_data_url )
    createChart( await resData.json() )
  } catch ( error ) {
    alert( error )
  }
} )

const opts = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    }
  },
}

function randomRGBA() {
  const x = Math.floor( Math.random() * 256 )
  const y = Math.floor( Math.random() * 256 )
  const z = Math.floor( Math.random() * 256 )
  return `rgba(${x}, ${y}, ${z}, 0.2)`
}

function datasetBuilder( d ) {
  return [
    {
      label: chartConf.label,
      data: d.map( ( { covid_death } ) => covid_death ),
      backgroundColor: d.map( randomRGBA ),
      borderColor: 'lightgrey',
      borderWidth: 0.5,
    },
  ]
}

function labelSetBuilder( d ) {
  return d.map( ( { county_name } ) => county_name )
}

function removeExistingChart() {

  // Get the canvas id from the lookup object and find the canvas in the DOM by id
  const canvasId = chartLkp['chart'].canvasId
  const oldCanvas = document.getElementById( canvasId )

  // Destroy chart instance (chart.js has a destroy method to remove the chart from the canvas element and cleanup event listeners etc.)
  chartLkp['chart'].chart.destroy()

  // Remove the canvas from the DOM
  oldCanvas.remove()

  // Remove the chart from the lookup object so we can create a new one later when the user clicks the button again to generate a new chart for a different state so there is only ever one chart on the page at a time
  delete chartLkp['chart']
}

function dateSpanTextContentCreator( data ) {
  const spanDateAsOf = document.getElementById( idTbl.dateSpan )
  let start_date = new Date( data[0].start_week ).toString().slice( 0, 15 )
  let end_date = new Date( data[0].end_week ).toString().slice( 0, 15 )
  spanDateAsOf.textContent = `Start Date: ${start_date} -- End Date: ${end_date}`
}

function createChart( data ) {

  dateSpanTextContentCreator( data )

  // Get the selected state from the dropdown menu using the selected index
  const selectedState = document.getElementById( idTbl.selector )
  const stateSelected = selectedState.options[selectedState.selectedIndex].text

  let countiesInState = data.filter( ( state ) => state.state_name === stateSelected )

  if ( countiesInState.length < 1 ) {
    alert( 'No data to show for this state' )
    return
  } else {

    const canvasId = chartConf.defineName()

    // Remove any existing canvas
    if ( chartLkp['chart'] ) {
      removeExistingChart()
    }

    const chartContainer = document.getElementById( idTbl.chartContainer )

    const newCanvas = document.createElement( 'canvas' )
    newCanvas.setAttribute( 'id', canvasId )

    chartContainer.appendChild( newCanvas )

    let ctx = document.getElementById( canvasId ).getContext( idTbl.context )

    const chart = new Chart( ctx, {
      type: chartConf.type,
      data: {
        labels: labelSetBuilder( countiesInState ),
        datasets: datasetBuilder( countiesInState ),
      },
      options: opts,
    } )

    chartLkp['chart'] = {
      canvasId,
      chart,
    }
  }
}
