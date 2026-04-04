#include<iostream>
#include "TrafficController.h"
#include "Scheduler.h"

TrafficController::TrafficController() {
    lanes.resize(4, 0);
}

void TrafficController::setLaneData(const vector<int>& data) {
    lanes = data;
}

int TrafficController::processTraffic() {

    cout << "Controller lanes: ";
    for (int x : lanes) cout << x << " ";
    cout << endl;

    return Scheduler::adaptiveSchedule(lanes);
}