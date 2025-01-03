from flask import Flask, render_template, jsonify, request
from flask_mysql_connector import MySQL
from dotenv import load_dotenv
import os


# connects flask server to backend database
load_dotenv()
print(os.getenv('USERNAME'))
app = Flask(__name__)
app.config['MYSQL_USER'] = os.getenv('USERNAME')
app.config['MYSQL_DATABASE'] = os.getenv('DATABASE')
app.config['MYSQL_PASSWORD'] = os.getenv('PASSWORD')
app.config['MYSQL_HOST'] = os.getenv('HOST')
mysql = MySQL(app)

# global variable to hold teams of current player needed to guess
TEAMS = []

# main page
@app.route('/')
def home():
    return render_template('index.html')


# calls database to get all players in database
@app.route('/getAllPlayers', methods=['GET'])
def getAllPlayers():
    cur = mysql.new_cursor(dictionary=True)
    cur.execute('''SELECT * FROM player''')
    output = cur.fetchall()
    return jsonify(output)


# route that calls database for current player
@app.route('/getTeams', methods=['POST'])
def getTeams():
    global TEAMS
    data = request.get_json()
    playerId = data['playerID']
    cur = mysql.new_cursor(dictionary=True)
    cur.execute(f'''SELECT * FROM player JOIN playedFor USING(playerID) JOIN team USING(teamID) WHERE playerID = {playerId} ORDER BY duplicateID''')
    output = cur.fetchall()
    TEAMS = output
    return jsonify(output)


# different page that shows the rules of the game
@app.route('/rules')
def fetch_page():
    return render_template('fetch.html')


# route that checks the answer of the current guess
@app.route('/checkAnswer', methods=['POST'])
def checkAnswer():
    global TEAMS
    player_teams = []
    for team in TEAMS:
        player_teams.append(team['teamFullName'])
    data = request.get_json()
    player = str(data['player'])
    cur = mysql.new_cursor(dictionary=True)
    query = f'''SELECT * FROM player JOIN playedFor USING(playerID) JOIN team USING(teamID) WHERE playerFullName = %s ORDER BY duplicateID'''
    cur.execute(query, (player,))
    output = cur.fetchall()
    guess_teams = []
    for team in output:
        guess_teams.append(team['teamFullName'])
    
    if player_teams == guess_teams:
        return jsonify({"message": "Correct"}), 200
    else:
        return jsonify({"message": "Incorrect"}), 200


# runs the flask server
if __name__ == "__main__":
    app.run(debug=True)