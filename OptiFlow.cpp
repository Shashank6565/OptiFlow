#include <iostream>
#include <queue>
#include <vector>
#include <string>
#include <cstdlib>
#include <ctime>
using namespace std;

struct Lane {
    string name;
    int vehicles;
    int avgVehicles;
};

struct Compare {
    bool operator()(Lane a, Lane b) {
        return a.avgVehicles < b.avgVehicles;
    }
};

// -------- CORE ALGORITHM --------
void runTrafficAlgorithms(vector<int> counts) {
    int cycleTime = 120;

    vector<Lane> lanes = {
        {"A", counts[0], 0},
        {"B", counts[1], 0},
        {"C", counts[2], 0},
        {"D", counts[3], 0}
    };

    cout << "\n===== TRAFFIC ANALYSIS =====\n";

    // Sliding Window Avg
    for (auto &l : lanes) {
        int r1 = l.vehicles;
        int r2 = l.vehicles + 2;
        int r3 = max(0, l.vehicles - 2);

        l.avgVehicles = (r1 + r2 + r3) / 3;

        cout << "Lane " << l.name
             << " Avg Vehicles: "
             << l.avgVehicles << endl;
    }

    // Max Heap
    priority_queue<Lane, vector<Lane>, Compare> pq;
    for (auto l : lanes) pq.push(l);

    cout << "\nGreedy Priority Order:\n";

    int remainingTime = cycleTime;

    while (!pq.empty() && remainingTime > 0) {
        Lane top = pq.top();
        pq.pop();

        int greenTime = max(20, top.avgVehicles * 2);
        if (greenTime > remainingTime)
            greenTime = remainingTime;

        cout << "\nLane " << top.name
             << " → GREEN for "
             << greenTime << " seconds";

        cout << "\n   YELLOW (3s)";
        cout << "\n   RED\n";

        remainingTime -= greenTime;
    }

    cout << "\nCycle Complete.\n";
}

// -------- AUTO MODE --------
void automaticMode() {
    srand(time(0));

    char cont = 'y';

    while (cont == 'y' || cont == 'Y') {
        vector<int> counts(4);

        cout << "\n--- AUTO GENERATED TRAFFIC ---\n";

        for (int i = 0; i < 4; i++) {
            counts[i] = rand() % 40; // 0–39 vehicles
        }

        cout << "Lane A: " << counts[0] << endl;
        cout << "Lane B: " << counts[1] << endl;
        cout << "Lane C: " << counts[2] << endl;
        cout << "Lane D: " << counts[3] << endl;

        runTrafficAlgorithms(counts);

        cout << "\nRun another auto cycle? (y/n): ";
        cin >> cont;
    }
}

// -------- MAIN --------
int main() {
    int choice;

    cout << "SMART TRAFFIC CONTROL SYSTEM\n";
    cout << "1. Manual Input\n";
    cout << "2. Automatic Mode\n";
    cout << "Choose: ";
    cin >> choice;

    if (choice == 1) {
        vector<int> counts(4);

        cout << "Enter vehicle counts for lanes A B C D:\n";
        for (int i = 0; i < 4; i++)
            cin >> counts[i];

        runTrafficAlgorithms(counts);
    }
    else if (choice == 2) {
        automaticMode();
    }

    return 0;
}
