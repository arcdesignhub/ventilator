// Once window is loaded
window.addEventListener('DOMContentLoaded', (event) => {
    // Scatterplot, with x and y coordinates
    // Eventually use GET request to get data

    var content = {
        x: [1, 2, 3, 4, 5],
        y: [1, 3, 1, 4, 1],
        mode: 'lines',
        type: 'scatter',
        line: {
            color: "#42bcef",
            width: 3
        }
    };
    
    var data = [content];
    
    // Prep layout and colors
    var layout = {
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        xaxis: {
            visible: true,
            color: "#fff",
            title: {
                text: "Time",
            },
            gridcolor: "#636365",
        },
        yaxis: {
            color: "#fff",
            title: {
                text: "Pressure",
            },
            gridcolor: "#636365",
        },
        margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 40,
        }
    };
    
    // Plot the graph
    Plotly.newPlot('graph-content', data, layout, {staticPlot: true});
});
