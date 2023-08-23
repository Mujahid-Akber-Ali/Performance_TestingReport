/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.54545454545455, "KoPercent": 0.45454545454545453};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.990909090909091, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Our Division"], "isController": false}, {"data": [1.0, 500, 1500, "Press Media"], "isController": false}, {"data": [0.975, 500, 1500, "Products"], "isController": false}, {"data": [1.0, 500, 1500, "CSR"], "isController": false}, {"data": [1.0, 500, 1500, "Our Niche"], "isController": false}, {"data": [0.95, 500, 1500, "Join US"], "isController": false}, {"data": [0.975, 500, 1500, "Contact US"], "isController": false}, {"data": [1.0, 500, 1500, "Team"], "isController": false}, {"data": [1.0, 500, 1500, "UtopiaPK"], "isController": false}, {"data": [1.0, 500, 1500, "About Us"], "isController": false}, {"data": [1.0, 500, 1500, "Tour"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 220, 1, 0.45454545454545453, 260.11818181818194, 135, 22694, 141.0, 153.8, 184.34999999999985, 1153.27, 7.363030891261421, 1.4142000338866763, 0.9071418784932561], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Our Division", 20, 0, 0.0, 142.85, 135, 186, 140.0, 149.8, 184.2, 186.0, 0.7032843378577959, 0.13736022223785077, 0.09203134889936002], "isController": false}, {"data": ["Press Media", 20, 0, 0.0, 144.7, 138, 167, 143.0, 158.3, 166.6, 167.0, 0.7094462771806604, 0.13579245149161082, 0.09145205916781952], "isController": false}, {"data": ["Products", 20, 0, 0.0, 201.49999999999997, 135, 1143, 139.5, 334.1000000000004, 1103.5499999999993, 1143.0, 0.7031607073796716, 0.1304692718770875, 0.08858176880075941], "isController": false}, {"data": ["CSR", 20, 0, 0.0, 144.05, 136, 185, 140.0, 169.30000000000007, 184.35, 185.0, 0.708792571853847, 0.12459244427118404, 0.08583035049792678], "isController": false}, {"data": ["Our Niche", 20, 0, 0.0, 150.6, 135, 360, 138.5, 148.8, 349.4499999999998, 360.0, 0.703210154354629, 0.13185190394149293, 0.08927472662705249], "isController": false}, {"data": ["Join US", 20, 1, 5.0, 1271.75, 136, 22694, 144.5, 168.70000000000002, 21567.799999999985, 22694.0, 0.7091947094074678, 0.2115464101450303, 0.08224303881068047], "isController": false}, {"data": ["Contact US", 20, 0, 0.0, 201.75000000000006, 136, 1156, 140.0, 325.6000000000004, 1115.4499999999994, 1156.0, 0.7092198581560284, 0.13020833333333334, 0.08865248226950355], "isController": false}, {"data": ["Team", 20, 0, 0.0, 143.55000000000004, 137, 169, 140.5, 151.9, 168.14999999999998, 169.0, 0.7098995492137863, 0.12617355269229405, 0.08665765981613602], "isController": false}, {"data": ["UtopiaPK", 20, 0, 0.0, 144.0, 138, 157, 142.0, 154.70000000000002, 156.9, 157.0, 0.7286770867490071, 0.11670218967464568, 0.08254545123328597], "isController": false}, {"data": ["About Us", 20, 0, 0.0, 164.9, 137, 372, 141.5, 331.3000000000004, 370.95, 372.0, 0.7288364126671769, 0.13096279290113336, 0.08968104296490653], "isController": false}, {"data": ["Tour", 20, 0, 0.0, 151.64999999999998, 135, 347, 141.0, 154.4, 337.39999999999986, 347.0, 0.7091947094074678, 0.12604827842984292, 0.08657161980071629], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, 100.0, 0.45454545454545453], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 220, 1, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Join US", 20, 1, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
