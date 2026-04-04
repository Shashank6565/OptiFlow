#include <iostream>
#include <fstream>
#include <vector>
#include "TrafficController.h"
#include "Utils.h"

using namespace std;

int main() {

    cout << "=== OptiFlow Scheduler ===" << endl;

    // 🔥 STEP 1: READ CSV
    vector<vector<int>> data = readCSV("../data/lane_counts.csv");

    // 🔥 DEBUG: check if data loaded
    cout << "Rows loaded: " << data.size() << endl;

    // 🔥 STEP 2: OPEN FILE (SAFE PATH)
    ofstream out("../data/realtime_data.csv");   // ✅ SAFE PATH

    if (!out.is_open()) {
        cout << "ERROR: File not opening!" << endl;
        return 1;
    }

    out << "Step,Adaptive\n";

    TrafficController controller;

    int step = 0;

    // 🔥 STEP 3: LOOP THROUGH DATA
    for (auto row : data) {

        vector<int> lanes(4);

        for (int i = 0; i < 4; i++) {
            lanes[i] = row[i + 1];
        }

        // 🔥 DEBUG PRINT
        cout << "Input lanes: ";
        for (int x : lanes) cout << x << " ";
        cout << endl;

        controller.setLaneData(lanes);

        int waiting = controller.processTraffic();

        cout << "Step " << step << " -> Waiting: " << waiting << endl;

        // 🔥 WRITE TO FILE
        out << step << "," << waiting << "\n";

        step++;
    }

    out.close();

    cout << "✅ File saved successfully!" << endl;

    return 0;
}