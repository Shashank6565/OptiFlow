#ifndef TRAFFIC_CONTROLLER_H
#define TRAFFIC_CONTROLLER_H

#include <vector>
using namespace std;

class TrafficController {
private:
    vector<int> lanes;

public:
    TrafficController();
    void setLaneData(const vector<int>& data);
    int processTraffic();
};

#endif