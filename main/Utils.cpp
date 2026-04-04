#include "Utils.h"
#include <fstream>
#include <sstream>
#include <iostream>

vector<vector<int>> readCSV(string filename) {

    ifstream file(filename);

    vector<vector<int>> data;

    if (!file.is_open()) {
        cout << "ERROR: Cannot open CSV file!" << endl;
        return data;
    }

    string line;

    getline(file, line); // skip header

    while (getline(file, line)) {
        stringstream ss(line);
        string temp;
        vector<int> row;

        while (getline(ss, temp, ',')) {
            row.push_back(stoi(temp));
        }

        data.push_back(row);
    }

    return data;
}