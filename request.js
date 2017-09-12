var request = require("request");

var program = `
        using System;
        using System.Collections.Generic;
        using System.Linq;
        using System.Text.RegularExpressions;

        namespace Rextester
        {
            public class Program
            {
                public static void Main(string[] args)
                {
                    //Your code goes here
                    Console.WriteLine("Hello, world!");
                }
            }
        }
`;

var to_compile = {
    "LanguageChoice": "1",
    "Program": program,
    "Input": "",
    "CompilerArgs": ""
};

request({
    type: "POST",
    url: "http://rextester.com/rundotnet/api",
    data: to_compile
}, function (e, response, body) {
    // console.log(e);
    // console.log(response);
    console.log(body);
});
