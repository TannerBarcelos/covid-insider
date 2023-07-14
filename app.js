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

const SOURCE_DATA_URL = 'https://data.cdc.gov/resource/kn79-hsxy.json'
const TODAYS_DATE = Date.now().toString()

const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
}

const CHART_LABELS = {
  BAR: 'Covid Deaths (Bar Chart)',
  LINE: 'Covid Deaths (Line Chart)',
  PIE: 'Covid Deaths (Pie Chart)',
}

const htmlIdSelectorLkp = {
  domSelectors: {
    dropdowns: {
      states: 'state-dropdown',
    },
    buttons: {
      generate: 'generate',
    },
    spans: {
      dateSpan: 'weekOf',
    }
  },
  chartSelectors: {
    bar: 'bar-chart-container',
    pie: 'pie-chart-container',
    line: 'line-chart-container',
  }
}

const chartConf = {
  bar: {
    defineUniqueChartName: () => `bar_${TODAYS_DATE}`,
    type: CHART_TYPES.BAR,
    label: CHART_LABELS.BAR,
  },
  line: {
    defineUniqueChartName: () => `line_${TODAYS_DATE}`,
    type: CHART_TYPES.LINE,
    label: CHART_LABELS.LINE,
  },
  pie: {
    defineUniqueChartName: () => `pie_${TODAYS_DATE}`,
    type: CHART_TYPES.PIE,
    label: CHART_LABELS.PIE,
  },
}

const chartCache = {}

const selector = document.getElementById( htmlIdSelectorLkp.domSelectors.dropdowns.states )

states.forEach( ( ind ) => {
  const option = document.createElement( 'option' )
  const optionText = document.createTextNode( `${ind}` )
  option.appendChild( optionText )
  selector.appendChild( option )
} )

document.getElementById( 'generate' ).addEventListener( 'click', async () => {
  try {
    const covidData = await fetch( SOURCE_DATA_URL )
    const chartData = await covidData.json()

    // Get the selected state from the dropdown menu using the selected index
    const stateDropdown = document.getElementById( htmlIdSelectorLkp.domSelectors.dropdowns.states )
    const stateSelected = stateDropdown.options[stateDropdown.selectedIndex].text

    let countiesInState = chartData.filter( ( state ) => state.state_name === stateSelected )
    if ( countiesInState.length < 1 ) {
      alert( 'No data to show for this state' )
      return
    } else {
      for ( let i = 0; i < 3; i++ ) {
        buildCharts( chartData, countiesInState )
      }
    }

  } catch ( error ) {
    alert( error )
  }
} )

function generateRandomNumber() {
  return Math.random() * 256
}

function generateRGBA() {
  const x = Math.floor( generateRandomNumber() )
  const y = Math.floor( generateRandomNumber() )
  const z = Math.floor( generateRandomNumber() )
  return `rgba(${x}, ${y}, ${z}, 0.2)`
}

function dataBuilder( chartData, chartType ) {
  return [
    {
      label: chartConf[chartType]['label'],
      data: chartData.map( ( { covid_death } ) => covid_death ),
      backgroundColor: chartData.map( generateRGBA ),
      borderColor: 'lightgrey',
      borderWidth: 0.5,
      fill: true,
    },
  ]
}

function labelBuilder( d ) {
  return d.map( ( { county_name } ) => county_name )
}

function removeExistingCharts() {
  Object.keys( chartCache ).map( ( chart ) => {
    const canvasId = chartCache[chart].canvasId
    const oldCanvas = document.getElementById( canvasId )
    chartCache[chart].chart.destroy()
    oldCanvas.remove()
    delete chartCache[chart]
  } )
}

function dateSpanTextContentCreator( data ) {
  const spanDateAsOf = document.getElementById( htmlIdSelectorLkp.domSelectors.spans.dateSpan )
  let start_date = new Date( data[0].start_week ).toString().slice( 0, 15 )
  let end_date = new Date( data[0].end_week ).toString().slice( 0, 15 )
  spanDateAsOf.textContent = `Start Date: ${start_date} -- End Date: ${end_date}`
}

function getCanvas() {
  return document.createElement( 'canvas' )
}

function buildChart( ctx, countiesInState, chartType, canvasIdUnique ) {

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      }
    }
  }

  if ( chartType !== CHART_TYPES.PIE ) {
    opts.scales = {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    }
  }

  if ( chartType === CHART_TYPES.PIE ) {
    opts.plugins.legend = {
      display: false
    }
  }

  const chart = new Chart( ctx, {
    type: chartType, // bar, line, pie dynamically generated
    data: {
      labels: labelBuilder( countiesInState ),
      datasets: dataBuilder( countiesInState, chartType ),
    },
    options: opts,
  } )

  // Cache the chart instance and canvas id in a lookup object so we can remove the chart later if the user clicks the button again to generate a new chart for a different state
  chartCache[chartType] = {
    canvasId: canvasIdUnique,
    chart,
  }
}

function buildCharts( data, counties ) {

  dateSpanTextContentCreator( data )

  if ( Object.keys( chartCache ).length ) removeExistingCharts()

  for ( let i = 0; i < 3; i++ ) {
    const chartType = Object.values( CHART_TYPES )[i]
    const canvasIdUnique = chartConf[chartType].defineUniqueChartName()
    const generatedCanvas = getCanvas()
    generatedCanvas.setAttribute( 'id', canvasIdUnique )
    const selectedChart = Object.values( htmlIdSelectorLkp.chartSelectors )[i]
    const chartContainer = document.getElementById( selectedChart )
    chartContainer.appendChild( generatedCanvas )
    let ctx = document.getElementById( canvasIdUnique ).getContext( '2d' )
    buildChart( ctx, counties, chartType, canvasIdUnique )
  }
}
