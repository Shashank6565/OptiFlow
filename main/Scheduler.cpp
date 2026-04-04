#include<iostream>
#include "Scheduler.h"
#include <queue>
#include <algorithm>

using namespace std;

const int MAX_CYCLE_TIME = 60;

int Scheduler::adaptiveSchedule(vector<int> lanes) {

    int waiting = 0;

    cout << "Processing lanes: ";

    for (int i = 0; i < lanes.size(); i++) {
        cout << lanes[i] << " ";

        int green = 5;   // fixed realistic time

        int remaining = lanes[i] - green;
        if (remaining < 0) remaining = 0;

        waiting += remaining;
    }

    cout << " -> Waiting: " << waiting << endl;

    return waiting;
}