//COUNTRY LIST FOR COVID DATA
const countryList = ['Italy', 'Spain', 'Bangladesh', 'Ecuador', 'Ireland', 'Benin', 'Botswana', 'Cameroon', 'Chile', 'Mozambique', 'Norway', 'Gabon', 'Nepal', 'Uganda', 'Cambodia', 'Colombia', 'India', 'Guatemala', 'Turkey', 'Lebanon', 'Mauritius', 'Togo', 'Taiwan', 'Qatar', 'Austria', 'Sweden', 'Nicaragua', 'Haiti', 'Laos', 'Slovenia', 'Finland', 'Croatia', 'Belarus', 'Kyrgyzstan', 'Bolivia', 'Panama', 'Belgium', 'Oman', 'Malaysia', 'Belize', 'Luxembourg', 'Greece', 'Hungary', 'Germany', 'Bahrain', 'Indonesia', 'Australia', 'Georgia', 'Kuwait', 'Niger', 'Netherlands', 'Namibia', 'Kenya', 'Denmark', 'Paraguay', 'Czechia', 'Slovakia', 'Jamaica', 'Thailand', 'Singapore', 'Nigeria', 'Moldova', 'France', 'Estonia', 'Ghana', 'Argentina', 'Poland', 'Libya', 'Canada', 'Kazakhstan', 'Afghanistan', 'Venezuela', 'Pakistan', 'Malta', 'Japan', 'Bulgaria', 'Uruguay', 'Egypt', 'Philippines', 'Romania', 'Aruba', 'Peru', 'Barbados', 'Senegal', 'Rwanda', 'Yemen', 'Honduras', 'Jordan', 'Serbia', 'Israel', 'Switzerland', 'Iraq', 'Vietnam', 'Zambia', 'Mongolia', 'Mexico', 'Zimbabwe', 'Brazil', 'Liechtenstein', 'Angola', 'Latvia', 'Fiji', 'Lithuania', 'Mali', 'Portugal'];
select = document.getElementById('selectBox');

for (var i = 0; i < countryList.length; i++) {
    var opt = document.createElement('option');
    opt.value = countryList[i];
    opt.innerHTML = countryList[i];
    opt.className = 'option-css'
    select.appendChild(opt);
}
is_country_changed = false
is_mobility_changed = false
mobility_factor = "Retail"
current_country = countryList[0]

//INITAL LOADINGS
get_map(`/Xdata/${current_country}`, false, false, true, false)

get_map('/continent/data', true, false, false, false)

get_map(`/data/${current_country}`, false, true, false, false)

get_map(`/factors/data/${current_country}`, false, false, false, true)

//COUNTRY CHANGE
function selectCountry(country) {
    get_map(`/data/${country}`, false, true, false, false)
    get_map(`/Xdata/${country}`, false, false, true, false)
    get_map(`/factors/data/${country}`, false, false, false, true)

    is_country_changed = true
    current_country = country
}
//CHANGE IN MOBILITY
function selectMobilityFactor(factor) {
    is_mobility_changed = true
    mobility_factor = factor
    get_map(`/factors/data/${current_country}`, false, false, false, true)
}

//RENDERING PIE CHART
function pie_chart(data_server) {
    var w = 900,                        //width
        h = 600,                            //height
        r = 180,                            //radius
        color = d3.scale.category20c();     //builtin range of colors

    const countryList = Object.keys(data_server)
    const values = Object.values(data_server)
    var sum = 0;
    for (v in values) {
        sum += v
    }
    data = []
    for (var i = 0; i < countryList.length; i++) {
        obj = {}
        country = countryList[i]
        obj['label'] = country,
            obj['value'] = values[i]
        data.push(obj)
    }
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    var vis = d3.select(".section-four")
        .append("svg:svg")              //create the SVG element inside the <body>
        .data([data])                   //associate our data with the document
        .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
        .attr("height", h)
        .append("svg:g")                //make a group to hold our pie chart
        .attr("transform", "translate(" + 250 + "," + 250 + ")")   //move the center of the pie chart from 0, 0 to radius, radius

    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r);

    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function (d) { return d.value; });    //we must tell it out to access the value of each element in our data array

    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
        .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
        .attr("class", "slice");    //allow us to style things in the slices (like text)

    arcs.append("svg:path")
        .attr("fill", function (d, i) { return color(i); }) //set the color for each slice to be chosen from the color function defined above
        .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

    arcs.append("svg:text")                                     //add a label to each slice
        .attr("transform", function (d) {                    //set the label's origin to the center of the arc
            //we have to make sure to set these before calling arc.centroid
            d.innerRadius = 0;
            d.outerRadius = r;
            return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
        })
        .attr("text-anchor", "middle")                          //center the text on it's origin
        .text(function (d, i) { return data[i].label });

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    arcs.on("mouseover", function (d) {
        tooltip.html(d.value)
            .style("visibility", "visible");
    })
        .on("mousemove", function (d) {
            tooltip.style("top", event.pageY - (tooltip[0][0].clientHeight + 5) + "px")
                .style("left", event.pageX - (tooltip[0][0].clientWidth / 2.0) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("visibility", "hidden");
        });
}

//RENDERING BAR CHART
function generateBarChart(sampleData) {
    data = sampleData
    if (is_country_changed) {
        d3.select('.bar-chart').remove();
    }
    var data = []
    no_of_inputs = sampleData['cases'].length
    no_of_dates = sampleData['dates'].length
    date_array = []

    for (var d = 0; d <= no_of_dates; d = d + 7) {
        if (sampleData['dates'][d + 6] == undefined) {
            end_date = sampleData['dates'][no_of_dates - 1]
        }
        else end_date = sampleData['dates'][d + 6]
        date_concatenated = sampleData['dates'][d] + "/" + end_date
        date_array.push(date_concatenated)
    }
    for (var i = 0; i < no_of_inputs; i++) {
        var obj = {
            'dates': date_array[i],
            'cases': sampleData.cases[i],
            'deaths': sampleData.deaths[i]
        }
        data.push(obj)
    }

    var margin = { top: 35, right: 0, bottom: 30, left: 40 };

    var width = 660 - margin.left - margin.right;
    var height = 280 - margin.top - margin.bottom;

    // Transpose the data into layers
    var dataset = d3.layout.stack()(["cases", "deaths"].map(function (feature) {
        return data.map(function (d) {
            return { x: d.dates, y: + parseInt(d[feature]) };
        });
    }));

    var chart = d3.select(".section-two")
        .append("svg")
        .attr("class", "bar-chart")
        .attr("width", 960)
        .attr("height", 600)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    ///////////////////////
    // Scales
    var x = d3.scale.ordinal()
        .domain(dataset[0].map(function (d) { return d.x; }))
        .rangeRoundBands([10, width - 10], 0.02);

    var y = d3.scale.linear()
        .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d.y0 + d.y; }); })])
        .range([height, 0]);

    var colors = ["#20B2AA", "#4682b4"];

    ///////////////////////
    // Axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font", "12px times")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    ///////////////////////

    ///////////////////////
    // Bars
    var groups = chart.selectAll("g.cost")
        .data(dataset)
        .enter().append("g")
        .attr("class", "cost")
        .style("fill", function (d, i) { return colors[i]; });

    var rect = groups.selectAll("rect")
        .data(function (d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.x); })
        .attr("y", function (d) {
            return y(d.y0 + d.y);
        })
        .attr("height", function (d) { return y(d.y0) - y(d.y0 + d.y); })
        .attr("width", x.rangeBand())


    var legend = chart.selectAll(".legend")
        .data(colors)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(30," + i * 19 + ")"; });

    legend.append("rect")
        .attr("x", width - 40)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) { return colors.slice().reverse()[i]; });

    legend.append("text")
        .attr("x", width - 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d, i) {
            switch (i) {
                case 0: return "deaths";
                case 1: return "cases"
            }
        });

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    rect.on("mouseover", function (d) {
        tooltip.html(d.y)
            .style("visibility", "visible");
    })
        .on("mousemove", function (d) {
            tooltip.style("top", event.pageY - (tooltip[0][0].clientHeight + 5) + "px")
                .style("left", event.pageX - (tooltip[0][0].clientWidth / 2.0) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("visibility", "hidden");
        });

    rect.transition()
        .duration(1500)
        .ease("elastic")
        .attr("y", function (d) { return y(d.y); })
        .attr("height", function (d) { return height - y(d.y); })
}

function generate_pc(data_server) {
    if (is_country_changed) {
        d3.select('.pc').remove();
    }
    dates = ['03-01~07-2020', '03-08~14-2020', '03-15~21-2020', '03-22~28-2020', '03-28~30-2020', '04-01~07-2020', '04-08~14-2020', '04-15~21-2020', '04-22~28-2020', '04-28~30-2020']
    chart_data = []
    no_of_lines = dates.length
    for (var i = 0; i < no_of_lines; i++) {
        obj = {}
        obj['date'] = dates[i]
        obj['retail_and_rec'] = data_server['retail_and_rec'][i]
        obj['workplaces'] = data_server['workplaces'][i]
        obj['residential'] = data_server['residential'][i]
        obj['grocery_and_pharmacy'] = data_server['grocery_and_pharmacy'][i]
        obj['parks'] = data_server['parks'][i]
        obj['transit_stations'] = data_server['transit_stations'][i]

        chart_data.push(obj)
    }
    var margin = { top: 30, right: 10, bottom: 10, left: 10 },
        width = 960 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {},
        dragging = {};

    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground;

    var svg = d3.select(".section-three")
        .append("svg")
        .attr('class', 'pc')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    mobility = chart_data

    x.domain(dimensions = d3.keys(mobility[0]).filter(function (d) {
        if (d != 'date') {
            var res = d3.scale.linear()
                .domain(d3.extent(mobility, function (p) { return +p[d] }))
                .range([height, 0]);
        } else {
            var res = d3.scale.ordinal().rangePoints([0, height]).domain(mobility.map(function (p) { return p[d] }))
        }
        y[d] = res;
        return res;
    }));

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(mobility)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(mobility)
        .enter().append("path")
        .attr("d", path);

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
            .origin(function (d) { return { x: x(d) }; })
            .on("dragstart", function (d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                dimensions.sort(function (a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function (d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function (p) { return [position(p), y[p](d[p])]; }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
            extents = actives.map(function (p) { return y[p].brush.extent(); });
        foreground.style("display", function (d) {
            return actives.every(function (p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? null : "none";
        });
    }
}

function drawScatter(sData) {
    if (is_country_changed || is_mobility_changed) {
        d3.select('.scatter-plot').remove();
    }
    var data = []
    var array = [];

    for (var i = 0; i < sData['cases'].length; ++i) {
        obj = {}
        obj.x = sData['cases'][i];
        obj.y = sData[mobility_factor][i];
        if (obj.clusterid == 'undefined')
            obj.clusterid = 3
        array.push(obj);
    }
    data = array;

    var margin = { top: 35, right: 10, bottom: 30, left: 40 };

    var width = 660 - margin.left - margin.right;
    var height = 280 - margin.top - margin.bottom;

    var xValue = function (d) { return d.x; }, xScale = d3.scale.linear().range([0, width]),
        xMap = function (d) { return xScale(xValue(d)); }, xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    var yValue = function (d) { return d.y; }, yScale = d3.scale.linear().range([height, 0]),
        yMap = function (d) { return yScale(yValue(d)); }, yAxis = d3.svg.axis().scale(yScale).orient("left");

    var color = d3.scale.category10();

    var svg = d3.select(".section-one")
        .append("svg")
        .attr('class', 'scatter-plot')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
    yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", -6)
        .attr("x", width)
        .text("Cases")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", 6)
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")
        .text("factor")
        .style("text-anchor", "end");

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", xMap)
        .attr("r", 3.5)
        .attr("cy", yMap)
        .style("fill", function (d) {
            return '#20B2AA'
        })
        .on("mouseover", function (d) {
            tooltip.html('cases' + " : " + d.x + ", " + 'mobility' + " : " + d.y)
                .style("visibility", "visible");
        })
        .on("mousemove", function (d) {
            tooltip.style("top", event.pageY - (tooltip[0][0].clientHeight + 5) + "px")
                .style("left", event.pageX - (tooltip[0][0].clientWidth / 2.0) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("visibility", "hidden");
        });
}

function get_map(url, is_pie_chart, is_bar_chart, is_parallel_coordinate, is_scatter) {
    result_data = []
    $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        xhrFields: {
            withCredentials: false
        },
        headers: {
        },
        success: function (result) {
            if (is_pie_chart) {
                pie_chart(result)
            }
            else if (is_bar_chart) {
                generateBarChart(result)
            }
            else if (is_parallel_coordinate) {
                generate_pc(result)
            }
            else if (is_scatter) {
                drawScatter(result)
            }

        },
        error: function (result) {
            $("#error").html(result);
        }
    });
    return result_data
}


