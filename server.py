import pandas as pd
import json
import numpy as np
from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request


app = Flask(__name__) 

global data_frame
global data_frame_X
@app.route("/")
def d3():
    return render_template('index.html')

@app.route("/Xdata/<section>")
def pc_data(section):
    c = request.view_args['section']
    cleaned_rows = data_frame_X[data_frame_X['country_region'] == c]
    cleaned_rows['date'] = pd.to_datetime(cleaned_rows['date'], format='%Y-%m-%d').dt.strftime('%m-%d-%Y')
    sorted_by_date = pd.DataFrame(cleaned_rows.sort_values(by='date'))
    data_in_range = sorted_by_date[(sorted_by_date.date.between("03-01-2020", "04-30-2020"))]

    dates = data_in_range['date'].values
    date_f =[str(date) for date in dates]
    retail_and_rec = data_in_range['retail_and_recreation_percent_change_from_baseline'].values
    retail_and_rec_f =[int(r_a_r) for r_a_r in retail_and_rec]
    retail_and_rec_avg = [(sum(retail_and_rec_f[i:i+7])/7) for i in range(0, len(retail_and_rec_f), 7)]

    grocery_and_pharmacy = data_in_range['grocery_and_pharmacy_percent_change_from_baseline'].values
    grocery_and_pharmacy_f =[int(r_a_r) for r_a_r in grocery_and_pharmacy]
    grocery_and_pharmacy_avg = [(sum(grocery_and_pharmacy_f[i:i+7])/7) for i in range(0, len(grocery_and_pharmacy_f), 7)]

    parks = data_in_range['parks_percent_change_from_baseline'].values
    parks_f =[int(r_a_r) for r_a_r in parks]
    parks_avg = [(sum(parks_f[i:i+7])/7) for i in range(0, len(parks_f), 7)]

    transit_stations = data_in_range['transit_stations_percent_change_from_baseline'].values
    transit_stations_f =[int(r_a_r) for r_a_r in transit_stations]
    transit_stations_avg = [(sum(transit_stations_f[i:i+7])/7) for i in range(0, len(transit_stations_f), 7)]

    workplaces = data_in_range['workplaces_percent_change_from_baseline'].values
    workplaces_f =[int(r_a_r) for r_a_r in workplaces]
    workplaces_avg = [(sum(workplaces_f[i:i+7])/7) for i in range(0, len(workplaces_f), 7)]

    residential = data_in_range['residential_percent_change_from_baseline'].values
    residential_f =[int(r_a_r) for r_a_r in residential]
    residential_avg = [(sum(residential_f[i:i+7])/7) for i in range(0, len(residential_f), 7)]

    obj = {}
    obj['retail_and_rec'] = retail_and_rec_avg 
    obj['grocery_and_pharmacy'] = grocery_and_pharmacy_avg
    obj['parks'] = parks_avg
    obj['transit_stations'] = transit_stations_avg
    obj['workplaces'] = workplaces_avg
    obj['residential'] = residential_avg
    return jsonify(obj)

@app.route("/data/<section>")
def data(section):
    global data_frame
    c = request.view_args['section']
    rows = data_frame[data_frame['countriesAndTerritories'] == c]
    rows['dateRep'] = pd.to_datetime(rows['dateRep'], format='%d/%m/%Y').dt.strftime('%m-%d-%Y')
    sorted_by_date = pd.DataFrame(rows.sort_values(by='dateRep'))
    data_in_range = sorted_by_date[(sorted_by_date.dateRep.between("03-01-2020", "04-30-2020"))]
    dates = data_in_range['dateRep'].values
    date_f =[str(date) for date in dates]
    cases = data_in_range['cases'].values
    case_f =[int(case) for case in cases]
    case_sum = [sum(case_f[i:i+7]) for i in range(0, len(case_f), 7)]
    deaths = data_in_range['deaths'].values
    death_f =[int(death) for death in deaths]
    deaths_sum = [sum(death_f[i:i+7]) for i in range(0, len(death_f), 7)]
    obj = {}
    obj['dates'] = date_f 
    obj['deaths'] = deaths_sum
    obj['cases'] = case_sum

    return jsonify(obj)

@app.route("/continent/data")
def data_continent():
    global data_frame
    continents  = ['America', 'Asia', 'Europe']
    obj = {}
    for continent in continents:
        cases = data_frame[data_frame['continentExp'] == continent]['cases'].values
        total = int(sum(cases))
        obj[continent] = total
    return jsonify(obj)

@app.route('/factors/data/<section>')
def correlation(section):
    global data_frame
    global data_frame_X
    c = request.view_args['section']
    rows_main = data_frame[data_frame['countriesAndTerritories'] == c]
    
    rows_main['dateRep'] = pd.to_datetime(rows_main['dateRep'], format='%d/%m/%Y').dt.strftime('%m-%d-%Y')
    rows_main_sorted_by_date = pd.DataFrame(rows_main.sort_values(by='dateRep'))
    rows_main_data_in_range = rows_main_sorted_by_date[(rows_main_sorted_by_date.dateRep.between("02-15-2020", "04-30-2020"))]
    cases = rows_main_data_in_range['cases'].values
    case_f =[int(case) for case in cases]
    rows_x = data_frame_X[data_frame_X['country_region'] == c]
    rows_x['date'] = pd.to_datetime(rows_x['date'], format='%Y-%m-%d').dt.strftime('%m-%d-%Y')
    rows_x_sorted_by_date = pd.DataFrame(rows_x.sort_values(by='date'))
    rows_x_data_in_range = rows_x_sorted_by_date[(rows_x_sorted_by_date.date.between("02-15-2020", "04-30-2020"))]
    retail_and_recreation_factor = rows_x_data_in_range['retail_and_recreation_percent_change_from_baseline'].values
    grocery_and_pharmacy_factor = rows_x_data_in_range['grocery_and_pharmacy_percent_change_from_baseline'].values
    parks_factor = rows_x_data_in_range['parks_percent_change_from_baseline'].values
    transit_stations_factor = rows_x_data_in_range['transit_stations_percent_change_from_baseline'].values
    workplaces_factor = rows_x_data_in_range['workplaces_percent_change_from_baseline'].values
    residential_factor = rows_x_data_in_range['residential_percent_change_from_baseline'].values
    retail_and_recreation_f =[int(f) for f in retail_and_recreation_factor]
    grocery_and_pharmacy_f =[int(f) for f in grocery_and_pharmacy_factor]
    parks_factor_f =[int(f) for f in parks_factor]
    transit_stations_f =[int(f) for f in transit_stations_factor]
    workplaces_f =[int(f) for f in workplaces_factor]
    residential_f =[int(f) for f in residential_factor]

    obj = {}
    obj['cases'] = case_f 
    obj['Retail'] = retail_and_recreation_f
    obj['Grocery'] = grocery_and_pharmacy_f
    obj['Parks'] = parks_factor_f
    obj['Transit'] = transit_stations_f
    obj['Workplaces'] = workplaces_f
    obj['Residential'] = residential_f
    return jsonify(obj)


if __name__ == "__main__":
    data = pd.read_csv('sample_data.csv')
    dataX = pd.read_csv('Xdataset.csv')
    data_frame = pd.DataFrame(data)
    data_frame_X = pd.DataFrame(dataX)
    app.run("localhost", 7777, debug=True)