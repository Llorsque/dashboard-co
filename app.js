// Sport Fryslân Dashboard – client-side
function getVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function setVar(name, val){ document.documentElement.style.setProperty(name, val); }

const AppState = {
  rows: [],
  filtered: [],
  filters: [],
  datasetName: null,
  schema: [],
  mapping: { name: 'naam', city: 'gemeente', group: 'sport', latitude: 'latitude', longitude: 'longitude' },
  theme: { brand: getVar('--brand') || '#212945', accent: getVar('--accent') || '#52E8E8', font: 'Archivo' },
  pendingFile: null,
  usingDummy: true,
  showBoundaries: true
};

const DummyRows = [
  {
    "naam": "Zwemmen Heerenveen 1",
    "gemeente": "Heerenveen",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Jeugd",
    "latitude": 52.883902,
    "longitude": 5.888205,
    "leden": 171,
    "vrijwilligers": 39,
    "contributie": 122
  },
  {
    "naam": "Schaatsen Súdwest-Fryslân 2",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Jeugd",
    "latitude": 53.044479,
    "longitude": 5.575085,
    "leden": 190,
    "vrijwilligers": 33,
    "contributie": 222
  },
  {
    "naam": "Badminton Vlieland 3",
    "gemeente": "Vlieland",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.296781,
    "longitude": 5.064668,
    "leden": 182,
    "vrijwilligers": 27,
    "contributie": 154
  },
  {
    "naam": "Korfbal Weststellingwerf 4",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Jeugd",
    "latitude": 52.820377,
    "longitude": 6.076354,
    "leden": 206,
    "vrijwilligers": 46,
    "contributie": 183
  },
  {
    "naam": "Hockey Weststellingwerf 5",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Senioren",
    "latitude": 52.924641,
    "longitude": 6.039957,
    "leden": 231,
    "vrijwilligers": 43,
    "contributie": 188
  },
  {
    "naam": "Gymnastiek Harlingen 6",
    "gemeente": "Harlingen",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Gemengd",
    "latitude": 53.187176,
    "longitude": 5.455431,
    "leden": 188,
    "vrijwilligers": 17,
    "contributie": 203
  },
  {
    "naam": "Tafeltennis Ooststellingwerf 7",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Gemengd",
    "latitude": 53.048637,
    "longitude": 6.25082,
    "leden": 201,
    "vrijwilligers": 28,
    "contributie": 156
  },
  {
    "naam": "Schaatsen Weststellingwerf 8",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 52.907791,
    "longitude": 6.032568,
    "leden": 122,
    "vrijwilligers": 14,
    "contributie": 142
  },
  {
    "naam": "Zwemmen Schiermonnikoog 9",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Gemengd",
    "latitude": 53.478478,
    "longitude": 6.186281,
    "leden": 126,
    "vrijwilligers": 11,
    "contributie": 228
  },
  {
    "naam": "Schaatsen Smallingerland 10",
    "gemeente": "Smallingerland",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Jeugd",
    "latitude": 53.161307,
    "longitude": 6.083086,
    "leden": 257,
    "vrijwilligers": 51,
    "contributie": 151
  },
  {
    "naam": "Tafeltennis Noardeast-Fryslân 11",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.34687,
    "longitude": 5.983301,
    "leden": 175,
    "vrijwilligers": 30,
    "contributie": 201
  },
  {
    "naam": "Rugby Weststellingwerf 12",
    "gemeente": "Weststellingwerf",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 52.915022,
    "longitude": 5.991749,
    "leden": 226,
    "vrijwilligers": 37,
    "contributie": 294
  },
  {
    "naam": "Volleybal Súdwest-Fryslân 13",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.070925,
    "longitude": 5.707776,
    "leden": 236,
    "vrijwilligers": 42,
    "contributie": 219
  },
  {
    "naam": "Badminton Dantumadiel 14",
    "gemeente": "Dantumadiel",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Gemengd",
    "latitude": 53.274059,
    "longitude": 6.064379,
    "leden": 186,
    "vrijwilligers": 37,
    "contributie": 170
  },
  {
    "naam": "Korfbal Vlieland 15",
    "gemeente": "Vlieland",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Jeugd",
    "latitude": 53.310035,
    "longitude": 5.077444,
    "leden": 168,
    "vrijwilligers": 13,
    "contributie": 194
  },
  {
    "naam": "Hockey Weststellingwerf 16",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Gemengd",
    "latitude": 52.951002,
    "longitude": 6.045114,
    "leden": 150,
    "vrijwilligers": 27,
    "contributie": 222
  },
  {
    "naam": "Voetbal De Fryske Marren 17",
    "gemeente": "De Fryske Marren",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 52.936826,
    "longitude": 5.685848,
    "leden": 173,
    "vrijwilligers": 41,
    "contributie": 181
  },
  {
    "naam": "Schaatsen Opsterland 18",
    "gemeente": "Opsterland",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Jeugd",
    "latitude": 52.966312,
    "longitude": 6.028539,
    "leden": 165,
    "vrijwilligers": 40,
    "contributie": 111
  },
  {
    "naam": "Honkbal/Softbal Vlieland 19",
    "gemeente": "Vlieland",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Gemengd",
    "latitude": 53.310633,
    "longitude": 5.051836,
    "leden": 223,
    "vrijwilligers": 40,
    "contributie": 211
  },
  {
    "naam": "Tennis Noardeast-Fryslân 20",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Gemengd",
    "latitude": 53.390626,
    "longitude": 6.040842,
    "leden": 93,
    "vrijwilligers": 17,
    "contributie": 280
  },
  {
    "naam": "Zwemmen Schiermonnikoog 21",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Jeugd",
    "latitude": 53.499285,
    "longitude": 6.164759,
    "leden": 193,
    "vrijwilligers": 33,
    "contributie": 177
  },
  {
    "naam": "Gymnastiek Ooststellingwerf 22",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Jeugd",
    "latitude": 52.911151,
    "longitude": 6.303255,
    "leden": 196,
    "vrijwilligers": 26,
    "contributie": 178
  },
  {
    "naam": "Tennis Terschelling 23",
    "gemeente": "Terschelling",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Gemengd",
    "latitude": 53.35622,
    "longitude": 5.340059,
    "leden": 290,
    "vrijwilligers": 51,
    "contributie": 235
  },
  {
    "naam": "Judo Ameland 24",
    "gemeente": "Ameland",
    "sportbond": "JBN",
    "sport": "Judo",
    "doelgroep": "Jeugd",
    "latitude": 53.43972,
    "longitude": 5.765619,
    "leden": 265,
    "vrijwilligers": 37,
    "contributie": 203
  },
  {
    "naam": "Hockey Tytsjerksteradiel 25",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Jeugd",
    "latitude": 53.214724,
    "longitude": 5.986652,
    "leden": 127,
    "vrijwilligers": 28,
    "contributie": 193
  },
  {
    "naam": "Volleybal Ooststellingwerf 26",
    "gemeente": "Ooststellingwerf",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 52.940654,
    "longitude": 6.275806,
    "leden": 211,
    "vrijwilligers": 48,
    "contributie": 210
  },
  {
    "naam": "Hockey Súdwest-Fryslân 27",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Jeugd",
    "latitude": 53.020901,
    "longitude": 5.707816,
    "leden": 129,
    "vrijwilligers": 10,
    "contributie": 139
  },
  {
    "naam": "Basketbal Súdwest-Fryslân 28",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Senioren",
    "latitude": 53.098219,
    "longitude": 5.705791,
    "leden": 131,
    "vrijwilligers": 19,
    "contributie": 177
  },
  {
    "naam": "Rugby Smallingerland 29",
    "gemeente": "Smallingerland",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 53.058842,
    "longitude": 6.019245,
    "leden": 289,
    "vrijwilligers": 37,
    "contributie": 147
  },
  {
    "naam": "Tennis Vlieland 30",
    "gemeente": "Vlieland",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 53.306475,
    "longitude": 5.066167,
    "leden": 184,
    "vrijwilligers": 37,
    "contributie": 186
  },
  {
    "naam": "Honkbal/Softbal Smallingerland 31",
    "gemeente": "Smallingerland",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Gemengd",
    "latitude": 53.152176,
    "longitude": 6.028046,
    "leden": 255,
    "vrijwilligers": 22,
    "contributie": 154
  },
  {
    "naam": "Schaatsen Terschelling 32",
    "gemeente": "Terschelling",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 53.349904,
    "longitude": 5.320733,
    "leden": 226,
    "vrijwilligers": 54,
    "contributie": 147
  },
  {
    "naam": "Schaatsen Ooststellingwerf 33",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.002627,
    "longitude": 6.196359,
    "leden": 130,
    "vrijwilligers": 17,
    "contributie": 137
  },
  {
    "naam": "Zwemmen Weststellingwerf 34",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Senioren",
    "latitude": 52.828181,
    "longitude": 6.037791,
    "leden": 97,
    "vrijwilligers": 12,
    "contributie": 206
  },
  {
    "naam": "Voetbal Achtkarspelen 35",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Senioren",
    "latitude": 53.288643,
    "longitude": 6.219717,
    "leden": 114,
    "vrijwilligers": 11,
    "contributie": 143
  },
  {
    "naam": "Handbal Vlieland 36",
    "gemeente": "Vlieland",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Jeugd",
    "latitude": 53.288526,
    "longitude": 5.057308,
    "leden": 228,
    "vrijwilligers": 24,
    "contributie": 151
  },
  {
    "naam": "Voetbal Vlieland 37",
    "gemeente": "Vlieland",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 53.308142,
    "longitude": 5.071167,
    "leden": 204,
    "vrijwilligers": 39,
    "contributie": 148
  },
  {
    "naam": "Volleybal De Fryske Marren 38",
    "gemeente": "De Fryske Marren",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 52.919315,
    "longitude": 5.802354,
    "leden": 170,
    "vrijwilligers": 23,
    "contributie": 198
  },
  {
    "naam": "Gymnastiek Weststellingwerf 39",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Jeugd",
    "latitude": 52.876365,
    "longitude": 5.963379,
    "leden": 92,
    "vrijwilligers": 8,
    "contributie": 125
  },
  {
    "naam": "Badminton Achtkarspelen 40",
    "gemeente": "Achtkarspelen",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.263379,
    "longitude": 6.171938,
    "leden": 175,
    "vrijwilligers": 26,
    "contributie": 130
  },
  {
    "naam": "Volleybal Leeuwarden 41",
    "gemeente": "Leeuwarden",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.1393,
    "longitude": 5.871108,
    "leden": 245,
    "vrijwilligers": 42,
    "contributie": 182
  },
  {
    "naam": "Gymnastiek Tytsjerksteradiel 42",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Senioren",
    "latitude": 53.160391,
    "longitude": 5.919321,
    "leden": 193,
    "vrijwilligers": 18,
    "contributie": 200
  },
  {
    "naam": "Volleybal Vlieland 43",
    "gemeente": "Vlieland",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Jeugd",
    "latitude": 53.315365,
    "longitude": 5.062955,
    "leden": 306,
    "vrijwilligers": 66,
    "contributie": 103
  },
  {
    "naam": "Korfbal Tytsjerksteradiel 44",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Senioren",
    "latitude": 53.143966,
    "longitude": 5.98785,
    "leden": 225,
    "vrijwilligers": 49,
    "contributie": 108
  },
  {
    "naam": "Rugby Weststellingwerf 45",
    "gemeente": "Weststellingwerf",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Jeugd",
    "latitude": 52.820972,
    "longitude": 6.035405,
    "leden": 211,
    "vrijwilligers": 46,
    "contributie": 155
  },
  {
    "naam": "Zwemmen Schiermonnikoog 46",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Jeugd",
    "latitude": 53.477286,
    "longitude": 6.179521,
    "leden": 225,
    "vrijwilligers": 30,
    "contributie": 178
  },
  {
    "naam": "Rugby Súdwest-Fryslân 47",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Gemengd",
    "latitude": 53.104702,
    "longitude": 5.61466,
    "leden": 266,
    "vrijwilligers": 63,
    "contributie": 169
  },
  {
    "naam": "Badminton Heerenveen 48",
    "gemeente": "Heerenveen",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.020226,
    "longitude": 5.885994,
    "leden": 238,
    "vrijwilligers": 48,
    "contributie": 198
  },
  {
    "naam": "Hockey Achtkarspelen 49",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Senioren",
    "latitude": 53.209823,
    "longitude": 6.227478,
    "leden": 216,
    "vrijwilligers": 18,
    "contributie": 161
  },
  {
    "naam": "Tennis Tytsjerksteradiel 50",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 53.140271,
    "longitude": 6.018092,
    "leden": 40,
    "vrijwilligers": 9,
    "contributie": 210
  },
  {
    "naam": "Atletiek Achtkarspelen 51",
    "gemeente": "Achtkarspelen",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Gemengd",
    "latitude": 53.246142,
    "longitude": 6.08994,
    "leden": 153,
    "vrijwilligers": 22,
    "contributie": 208
  },
  {
    "naam": "Rugby Opsterland 52",
    "gemeente": "Opsterland",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Gemengd",
    "latitude": 53.016706,
    "longitude": 6.020694,
    "leden": 179,
    "vrijwilligers": 31,
    "contributie": 153
  },
  {
    "naam": "Atletiek Dantumadiel 53",
    "gemeente": "Dantumadiel",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.30067,
    "longitude": 5.905065,
    "leden": 96,
    "vrijwilligers": 18,
    "contributie": 194
  },
  {
    "naam": "Honkbal/Softbal Schiermonnikoog 54",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Gemengd",
    "latitude": 53.480971,
    "longitude": 6.173725,
    "leden": 194,
    "vrijwilligers": 32,
    "contributie": 187
  },
  {
    "naam": "Zwemmen Achtkarspelen 55",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Gemengd",
    "latitude": 53.154942,
    "longitude": 6.22232,
    "leden": 132,
    "vrijwilligers": 13,
    "contributie": 233
  },
  {
    "naam": "Schaatsen Smallingerland 56",
    "gemeente": "Smallingerland",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.071675,
    "longitude": 6.094922,
    "leden": 95,
    "vrijwilligers": 10,
    "contributie": 200
  },
  {
    "naam": "Voetbal Dantumadiel 57",
    "gemeente": "Dantumadiel",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Jeugd",
    "latitude": 53.2921,
    "longitude": 5.944038,
    "leden": 188,
    "vrijwilligers": 40,
    "contributie": 150
  },
  {
    "naam": "Hockey Terschelling 58",
    "gemeente": "Terschelling",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Senioren",
    "latitude": 53.365282,
    "longitude": 5.335596,
    "leden": 232,
    "vrijwilligers": 39,
    "contributie": 204
  },
  {
    "naam": "Tafeltennis Vlieland 59",
    "gemeente": "Vlieland",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Gemengd",
    "latitude": 53.303818,
    "longitude": 5.084702,
    "leden": 238,
    "vrijwilligers": 36,
    "contributie": 107
  },
  {
    "naam": "Honkbal/Softbal Vlieland 60",
    "gemeente": "Vlieland",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Senioren",
    "latitude": 53.297837,
    "longitude": 5.053066,
    "leden": 176,
    "vrijwilligers": 33,
    "contributie": 201
  },
  {
    "naam": "Tafeltennis Terschelling 61",
    "gemeente": "Terschelling",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.366084,
    "longitude": 5.32287,
    "leden": 168,
    "vrijwilligers": 23,
    "contributie": 150
  },
  {
    "naam": "Rugby Vlieland 62",
    "gemeente": "Vlieland",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Gemengd",
    "latitude": 53.283223,
    "longitude": 5.052733,
    "leden": 207,
    "vrijwilligers": 31,
    "contributie": 194
  },
  {
    "naam": "Tennis Achtkarspelen 63",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 53.226818,
    "longitude": 6.136524,
    "leden": 87,
    "vrijwilligers": 20,
    "contributie": 213
  },
  {
    "naam": "Rugby Leeuwarden 64",
    "gemeente": "Leeuwarden",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 53.258477,
    "longitude": 5.842395,
    "leden": 245,
    "vrijwilligers": 50,
    "contributie": 176
  },
  {
    "naam": "Zwemmen Tytsjerksteradiel 65",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Senioren",
    "latitude": 53.226115,
    "longitude": 5.987541,
    "leden": 194,
    "vrijwilligers": 16,
    "contributie": 211
  },
  {
    "naam": "Basketbal Achtkarspelen 66",
    "gemeente": "Achtkarspelen",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Senioren",
    "latitude": 53.24702,
    "longitude": 6.197703,
    "leden": 352,
    "vrijwilligers": 60,
    "contributie": 127
  },
  {
    "naam": "Schaatsen Dantumadiel 67",
    "gemeente": "Dantumadiel",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 53.307703,
    "longitude": 6.01108,
    "leden": 53,
    "vrijwilligers": 5,
    "contributie": 205
  },
  {
    "naam": "Korfbal Weststellingwerf 68",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Senioren",
    "latitude": 52.856157,
    "longitude": 5.957066,
    "leden": 184,
    "vrijwilligers": 38,
    "contributie": 140
  },
  {
    "naam": "Voetbal Tytsjerksteradiel 69",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 53.180363,
    "longitude": 5.883105,
    "leden": 40,
    "vrijwilligers": 5,
    "contributie": 138
  },
  {
    "naam": "Voetbal Súdwest-Fryslân 70",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Jeugd",
    "latitude": 53.074997,
    "longitude": 5.674281,
    "leden": 184,
    "vrijwilligers": 19,
    "contributie": 181
  },
  {
    "naam": "Tennis De Fryske Marren 71",
    "gemeente": "De Fryske Marren",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 52.95277,
    "longitude": 5.678302,
    "leden": 142,
    "vrijwilligers": 15,
    "contributie": 118
  },
  {
    "naam": "Atletiek Heerenveen 72",
    "gemeente": "Heerenveen",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.004347,
    "longitude": 5.870403,
    "leden": 40,
    "vrijwilligers": 7,
    "contributie": 136
  },
  {
    "naam": "Schaatsen Dantumadiel 73",
    "gemeente": "Dantumadiel",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 53.276465,
    "longitude": 6.019402,
    "leden": 144,
    "vrijwilligers": 14,
    "contributie": 129
  },
  {
    "naam": "Hockey Opsterland 74",
    "gemeente": "Opsterland",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Gemengd",
    "latitude": 53.064047,
    "longitude": 6.086066,
    "leden": 193,
    "vrijwilligers": 29,
    "contributie": 143
  },
  {
    "naam": "Voetbal Harlingen 75",
    "gemeente": "Harlingen",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Senioren",
    "latitude": 53.105833,
    "longitude": 5.446307,
    "leden": 194,
    "vrijwilligers": 47,
    "contributie": 160
  },
  {
    "naam": "Badminton Schiermonnikoog 76",
    "gemeente": "Schiermonnikoog",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Gemengd",
    "latitude": 53.491592,
    "longitude": 6.164119,
    "leden": 211,
    "vrijwilligers": 34,
    "contributie": 134
  },
  {
    "naam": "Korfbal Tytsjerksteradiel 77",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Jeugd",
    "latitude": 53.272118,
    "longitude": 5.964796,
    "leden": 194,
    "vrijwilligers": 44,
    "contributie": 161
  },
  {
    "naam": "Rugby Ooststellingwerf 78",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 53.030076,
    "longitude": 6.281176,
    "leden": 314,
    "vrijwilligers": 34,
    "contributie": 187
  },
  {
    "naam": "Badminton Noardeast-Fryslân 79",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Gemengd",
    "latitude": 53.298772,
    "longitude": 5.961336,
    "leden": 163,
    "vrijwilligers": 13,
    "contributie": 148
  },
  {
    "naam": "Honkbal/Softbal Noardeast-Fryslân 80",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Gemengd",
    "latitude": 53.255698,
    "longitude": 6.035212,
    "leden": 185,
    "vrijwilligers": 35,
    "contributie": 121
  },
  {
    "naam": "Atletiek Ameland 81",
    "gemeente": "Ameland",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.447927,
    "longitude": 5.74739,
    "leden": 136,
    "vrijwilligers": 26,
    "contributie": 189
  },
  {
    "naam": "Judo Harlingen 82",
    "gemeente": "Harlingen",
    "sportbond": "JBN",
    "sport": "Judo",
    "doelgroep": "Gemengd",
    "latitude": 53.170522,
    "longitude": 5.427648,
    "leden": 118,
    "vrijwilligers": 18,
    "contributie": 164
  },
  {
    "naam": "Tennis Opsterland 83",
    "gemeente": "Opsterland",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 52.968225,
    "longitude": 6.009305,
    "leden": 243,
    "vrijwilligers": 50,
    "contributie": 204
  },
  {
    "naam": "Badminton Waadhoeke 84",
    "gemeente": "Waadhoeke",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Gemengd",
    "latitude": 53.147647,
    "longitude": 5.578177,
    "leden": 79,
    "vrijwilligers": 14,
    "contributie": 143
  },
  {
    "naam": "Handbal Heerenveen 85",
    "gemeente": "Heerenveen",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Jeugd",
    "latitude": 53.013121,
    "longitude": 5.891599,
    "leden": 144,
    "vrijwilligers": 14,
    "contributie": 226
  },
  {
    "naam": "Volleybal Smallingerland 86",
    "gemeente": "Smallingerland",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.188387,
    "longitude": 6.107437,
    "leden": 235,
    "vrijwilligers": 53,
    "contributie": 145
  },
  {
    "naam": "Basketbal Opsterland 87",
    "gemeente": "Opsterland",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Jeugd",
    "latitude": 53.003104,
    "longitude": 6.060475,
    "leden": 177,
    "vrijwilligers": 17,
    "contributie": 244
  },
  {
    "naam": "Gymnastiek Súdwest-Fryslân 88",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Jeugd",
    "latitude": 53.014113,
    "longitude": 5.581853,
    "leden": 233,
    "vrijwilligers": 30,
    "contributie": 211
  },
  {
    "naam": "Zwemmen Ooststellingwerf 89",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Gemengd",
    "latitude": 52.928952,
    "longitude": 6.312311,
    "leden": 68,
    "vrijwilligers": 8,
    "contributie": 227
  },
  {
    "naam": "Hockey Tytsjerksteradiel 90",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Jeugd",
    "latitude": 53.188861,
    "longitude": 5.969364,
    "leden": 141,
    "vrijwilligers": 13,
    "contributie": 155
  },
  {
    "naam": "Voetbal Ooststellingwerf 91",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Senioren",
    "latitude": 52.93781,
    "longitude": 6.20201,
    "leden": 90,
    "vrijwilligers": 11,
    "contributie": 189
  },
  {
    "naam": "Tafeltennis Ooststellingwerf 92",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 52.956097,
    "longitude": 6.235235,
    "leden": 119,
    "vrijwilligers": 25,
    "contributie": 101
  },
  {
    "naam": "Volleybal Noardeast-Fryslân 93",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 53.310022,
    "longitude": 6.00713,
    "leden": 192,
    "vrijwilligers": 20,
    "contributie": 163
  },
  {
    "naam": "Atletiek Opsterland 94",
    "gemeente": "Opsterland",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Senioren",
    "latitude": 53.023207,
    "longitude": 6.121878,
    "leden": 255,
    "vrijwilligers": 50,
    "contributie": 212
  },
  {
    "naam": "Schaatsen Weststellingwerf 95",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 52.875576,
    "longitude": 6.002207,
    "leden": 252,
    "vrijwilligers": 33,
    "contributie": 184
  },
  {
    "naam": "Voetbal Weststellingwerf 96",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 52.799638,
    "longitude": 5.959828,
    "leden": 219,
    "vrijwilligers": 45,
    "contributie": 133
  },
  {
    "naam": "Badminton Waadhoeke 97",
    "gemeente": "Waadhoeke",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.19228,
    "longitude": 5.564242,
    "leden": 254,
    "vrijwilligers": 55,
    "contributie": 174
  },
  {
    "naam": "Korfbal Súdwest-Fryslân 98",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Gemengd",
    "latitude": 53.025202,
    "longitude": 5.635336,
    "leden": 212,
    "vrijwilligers": 31,
    "contributie": 187
  },
  {
    "naam": "Gymnastiek Ameland 99",
    "gemeente": "Ameland",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Senioren",
    "latitude": 53.441529,
    "longitude": 5.784508,
    "leden": 225,
    "vrijwilligers": 22,
    "contributie": 189
  },
  {
    "naam": "Voetbal Dantumadiel 100",
    "gemeente": "Dantumadiel",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 53.351386,
    "longitude": 6.036988,
    "leden": 233,
    "vrijwilligers": 20,
    "contributie": 146
  },
  {
    "naam": "Tafeltennis Terschelling 101",
    "gemeente": "Terschelling",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.361171,
    "longitude": 5.343558,
    "leden": 205,
    "vrijwilligers": 48,
    "contributie": 217
  },
  {
    "naam": "Voetbal Schiermonnikoog 102",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 53.498534,
    "longitude": 6.166088,
    "leden": 139,
    "vrijwilligers": 14,
    "contributie": 158
  },
  {
    "naam": "Zwemmen Vlieland 103",
    "gemeente": "Vlieland",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Jeugd",
    "latitude": 53.280547,
    "longitude": 5.06302,
    "leden": 146,
    "vrijwilligers": 32,
    "contributie": 179
  },
  {
    "naam": "Badminton Ameland 104",
    "gemeente": "Ameland",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Senioren",
    "latitude": 53.467306,
    "longitude": 5.758374,
    "leden": 279,
    "vrijwilligers": 33,
    "contributie": 90
  },
  {
    "naam": "Volleybal Vlieland 105",
    "gemeente": "Vlieland",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Jeugd",
    "latitude": 53.285786,
    "longitude": 5.054324,
    "leden": 159,
    "vrijwilligers": 23,
    "contributie": 235
  },
  {
    "naam": "Atletiek Terschelling 106",
    "gemeente": "Terschelling",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Gemengd",
    "latitude": 53.357387,
    "longitude": 5.313403,
    "leden": 89,
    "vrijwilligers": 20,
    "contributie": 150
  },
  {
    "naam": "Rugby Schiermonnikoog 107",
    "gemeente": "Schiermonnikoog",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 53.484843,
    "longitude": 6.160505,
    "leden": 308,
    "vrijwilligers": 75,
    "contributie": 146
  },
  {
    "naam": "Judo Ooststellingwerf 108",
    "gemeente": "Ooststellingwerf",
    "sportbond": "JBN",
    "sport": "Judo",
    "doelgroep": "Jeugd",
    "latitude": 53.001488,
    "longitude": 6.22737,
    "leden": 147,
    "vrijwilligers": 34,
    "contributie": 211
  },
  {
    "naam": "Volleybal Dantumadiel 109",
    "gemeente": "Dantumadiel",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 53.274773,
    "longitude": 6.01119,
    "leden": 215,
    "vrijwilligers": 52,
    "contributie": 171
  },
  {
    "naam": "Tafeltennis Achtkarspelen 110",
    "gemeente": "Achtkarspelen",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.279152,
    "longitude": 6.20987,
    "leden": 103,
    "vrijwilligers": 20,
    "contributie": 168
  },
  {
    "naam": "Schaatsen Tytsjerksteradiel 111",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.279349,
    "longitude": 6.025193,
    "leden": 190,
    "vrijwilligers": 35,
    "contributie": 148
  },
  {
    "naam": "Rugby Dantumadiel 112",
    "gemeente": "Dantumadiel",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 53.316974,
    "longitude": 6.041282,
    "leden": 77,
    "vrijwilligers": 12,
    "contributie": 122
  },
  {
    "naam": "Atletiek Vlieland 113",
    "gemeente": "Vlieland",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.281436,
    "longitude": 5.049437,
    "leden": 178,
    "vrijwilligers": 17,
    "contributie": 137
  },
  {
    "naam": "Voetbal Heerenveen 114",
    "gemeente": "Heerenveen",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Jeugd",
    "latitude": 52.950889,
    "longitude": 5.95524,
    "leden": 169,
    "vrijwilligers": 23,
    "contributie": 185
  },
  {
    "naam": "Basketbal Tytsjerksteradiel 115",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Jeugd",
    "latitude": 53.163291,
    "longitude": 5.954987,
    "leden": 223,
    "vrijwilligers": 32,
    "contributie": 217
  },
  {
    "naam": "Zwemmen Ooststellingwerf 116",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Senioren",
    "latitude": 52.989627,
    "longitude": 6.283305,
    "leden": 129,
    "vrijwilligers": 24,
    "contributie": 145
  },
  {
    "naam": "Basketbal Schiermonnikoog 117",
    "gemeente": "Schiermonnikoog",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Jeugd",
    "latitude": 53.499348,
    "longitude": 6.173804,
    "leden": 119,
    "vrijwilligers": 21,
    "contributie": 186
  },
  {
    "naam": "Atletiek Tytsjerksteradiel 118",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.25045,
    "longitude": 5.943094,
    "leden": 317,
    "vrijwilligers": 31,
    "contributie": 174
  },
  {
    "naam": "Atletiek Dantumadiel 119",
    "gemeente": "Dantumadiel",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.304508,
    "longitude": 5.99697,
    "leden": 281,
    "vrijwilligers": 35,
    "contributie": 167
  },
  {
    "naam": "Atletiek Smallingerland 120",
    "gemeente": "Smallingerland",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Jeugd",
    "latitude": 53.178199,
    "longitude": 6.138128,
    "leden": 128,
    "vrijwilligers": 24,
    "contributie": 154
  },
  {
    "naam": "Volleybal Weststellingwerf 121",
    "gemeente": "Weststellingwerf",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 52.903942,
    "longitude": 6.038549,
    "leden": 260,
    "vrijwilligers": 22,
    "contributie": 203
  },
  {
    "naam": "Volleybal Schiermonnikoog 122",
    "gemeente": "Schiermonnikoog",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Jeugd",
    "latitude": 53.464635,
    "longitude": 6.161294,
    "leden": 232,
    "vrijwilligers": 34,
    "contributie": 158
  },
  {
    "naam": "Handbal Noardeast-Fryslân 123",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Gemengd",
    "latitude": 53.263146,
    "longitude": 6.006305,
    "leden": 124,
    "vrijwilligers": 13,
    "contributie": 174
  },
  {
    "naam": "Korfbal Ameland 124",
    "gemeente": "Ameland",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Jeugd",
    "latitude": 53.468695,
    "longitude": 5.758506,
    "leden": 152,
    "vrijwilligers": 31,
    "contributie": 177
  },
  {
    "naam": "Rugby Ooststellingwerf 125",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Gemengd",
    "latitude": 53.047622,
    "longitude": 6.305875,
    "leden": 97,
    "vrijwilligers": 7,
    "contributie": 221
  },
  {
    "naam": "Badminton Vlieland 126",
    "gemeente": "Vlieland",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Gemengd",
    "latitude": 53.284944,
    "longitude": 5.061443,
    "leden": 106,
    "vrijwilligers": 15,
    "contributie": 208
  },
  {
    "naam": "Korfbal Ooststellingwerf 127",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Gemengd",
    "latitude": 52.985436,
    "longitude": 6.289127,
    "leden": 184,
    "vrijwilligers": 40,
    "contributie": 187
  },
  {
    "naam": "Gymnastiek Opsterland 128",
    "gemeente": "Opsterland",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Jeugd",
    "latitude": 53.031878,
    "longitude": 6.008668,
    "leden": 152,
    "vrijwilligers": 14,
    "contributie": 213
  },
  {
    "naam": "Judo Vlieland 129",
    "gemeente": "Vlieland",
    "sportbond": "JBN",
    "sport": "Judo",
    "doelgroep": "Gemengd",
    "latitude": 53.285427,
    "longitude": 5.064846,
    "leden": 178,
    "vrijwilligers": 26,
    "contributie": 154
  },
  {
    "naam": "Badminton Heerenveen 130",
    "gemeente": "Heerenveen",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.013291,
    "longitude": 5.942704,
    "leden": 162,
    "vrijwilligers": 25,
    "contributie": 152
  },
  {
    "naam": "Handbal Ooststellingwerf 131",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Gemengd",
    "latitude": 53.046872,
    "longitude": 6.205897,
    "leden": 262,
    "vrijwilligers": 23,
    "contributie": 145
  },
  {
    "naam": "Tafeltennis Weststellingwerf 132",
    "gemeente": "Weststellingwerf",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 52.825869,
    "longitude": 5.942746,
    "leden": 127,
    "vrijwilligers": 23,
    "contributie": 132
  },
  {
    "naam": "Volleybal Leeuwarden 133",
    "gemeente": "Leeuwarden",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.129493,
    "longitude": 5.773261,
    "leden": 216,
    "vrijwilligers": 37,
    "contributie": 238
  },
  {
    "naam": "Volleybal Noardeast-Fryslân 134",
    "gemeente": "Noardeast-Fryslân",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.372088,
    "longitude": 5.95728,
    "leden": 318,
    "vrijwilligers": 33,
    "contributie": 176
  },
  {
    "naam": "Hockey De Fryske Marren 135",
    "gemeente": "De Fryske Marren",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Gemengd",
    "latitude": 52.963434,
    "longitude": 5.787762,
    "leden": 204,
    "vrijwilligers": 28,
    "contributie": 161
  },
  {
    "naam": "Badminton Ooststellingwerf 136",
    "gemeente": "Ooststellingwerf",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.004216,
    "longitude": 6.192525,
    "leden": 231,
    "vrijwilligers": 22,
    "contributie": 201
  },
  {
    "naam": "Hockey Súdwest-Fryslân 137",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Senioren",
    "latitude": 53.026199,
    "longitude": 5.694483,
    "leden": 40,
    "vrijwilligers": 5,
    "contributie": 172
  },
  {
    "naam": "Voetbal Terschelling 138",
    "gemeente": "Terschelling",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Jeugd",
    "latitude": 53.358765,
    "longitude": 5.339034,
    "leden": 315,
    "vrijwilligers": 48,
    "contributie": 174
  },
  {
    "naam": "Schaatsen Heerenveen 139",
    "gemeente": "Heerenveen",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Jeugd",
    "latitude": 52.958343,
    "longitude": 5.989752,
    "leden": 162,
    "vrijwilligers": 16,
    "contributie": 192
  },
  {
    "naam": "Atletiek Vlieland 140",
    "gemeente": "Vlieland",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Senioren",
    "latitude": 53.308486,
    "longitude": 5.061936,
    "leden": 105,
    "vrijwilligers": 22,
    "contributie": 173
  },
  {
    "naam": "Tennis Heerenveen 141",
    "gemeente": "Heerenveen",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 53.016347,
    "longitude": 5.948347,
    "leden": 131,
    "vrijwilligers": 18,
    "contributie": 182
  },
  {
    "naam": "Korfbal Schiermonnikoog 142",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Senioren",
    "latitude": 53.479249,
    "longitude": 6.175885,
    "leden": 159,
    "vrijwilligers": 38,
    "contributie": 199
  },
  {
    "naam": "Schaatsen Ameland 143",
    "gemeente": "Ameland",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.432685,
    "longitude": 5.779971,
    "leden": 274,
    "vrijwilligers": 59,
    "contributie": 207
  },
  {
    "naam": "Korfbal Vlieland 144",
    "gemeente": "Vlieland",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Gemengd",
    "latitude": 53.282399,
    "longitude": 5.084965,
    "leden": 227,
    "vrijwilligers": 43,
    "contributie": 197
  },
  {
    "naam": "Atletiek Tytsjerksteradiel 145",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Gemengd",
    "latitude": 53.278895,
    "longitude": 5.98537,
    "leden": 167,
    "vrijwilligers": 27,
    "contributie": 190
  },
  {
    "naam": "Hockey De Fryske Marren 146",
    "gemeente": "De Fryske Marren",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Senioren",
    "latitude": 52.982078,
    "longitude": 5.695879,
    "leden": 217,
    "vrijwilligers": 45,
    "contributie": 147
  },
  {
    "naam": "Voetbal Ooststellingwerf 147",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Gemengd",
    "latitude": 53.039155,
    "longitude": 6.325225,
    "leden": 298,
    "vrijwilligers": 37,
    "contributie": 146
  },
  {
    "naam": "Korfbal Waadhoeke 148",
    "gemeente": "Waadhoeke",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Senioren",
    "latitude": 53.160723,
    "longitude": 5.581986,
    "leden": 321,
    "vrijwilligers": 56,
    "contributie": 177
  },
  {
    "naam": "Voetbal Dantumadiel 149",
    "gemeente": "Dantumadiel",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Jeugd",
    "latitude": 53.224134,
    "longitude": 6.023555,
    "leden": 178,
    "vrijwilligers": 26,
    "contributie": 150
  },
  {
    "naam": "Korfbal Achtkarspelen 150",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Gemengd",
    "latitude": 53.165185,
    "longitude": 6.119862,
    "leden": 60,
    "vrijwilligers": 6,
    "contributie": 133
  },
  {
    "naam": "Judo Smallingerland 151",
    "gemeente": "Smallingerland",
    "sportbond": "JBN",
    "sport": "Judo",
    "doelgroep": "Senioren",
    "latitude": 53.140335,
    "longitude": 6.062436,
    "leden": 123,
    "vrijwilligers": 14,
    "contributie": 152
  },
  {
    "naam": "Atletiek Terschelling 152",
    "gemeente": "Terschelling",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Gemengd",
    "latitude": 53.351253,
    "longitude": 5.330497,
    "leden": 144,
    "vrijwilligers": 27,
    "contributie": 138
  },
  {
    "naam": "Gymnastiek Smallingerland 153",
    "gemeente": "Smallingerland",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Jeugd",
    "latitude": 53.067783,
    "longitude": 6.176411,
    "leden": 227,
    "vrijwilligers": 47,
    "contributie": 255
  },
  {
    "naam": "Honkbal/Softbal Weststellingwerf 154",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Gemengd",
    "latitude": 52.841812,
    "longitude": 5.942397,
    "leden": 146,
    "vrijwilligers": 24,
    "contributie": 182
  },
  {
    "naam": "Handbal Ooststellingwerf 155",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Jeugd",
    "latitude": 52.990042,
    "longitude": 6.323337,
    "leden": 88,
    "vrijwilligers": 13,
    "contributie": 209
  },
  {
    "naam": "Judo Schiermonnikoog 156",
    "gemeente": "Schiermonnikoog",
    "sportbond": "JBN",
    "sport": "Judo",
    "doelgroep": "Gemengd",
    "latitude": 53.500146,
    "longitude": 6.181184,
    "leden": 97,
    "vrijwilligers": 12,
    "contributie": 203
  },
  {
    "naam": "Tafeltennis Dantumadiel 157",
    "gemeente": "Dantumadiel",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Gemengd",
    "latitude": 53.216337,
    "longitude": 5.956963,
    "leden": 206,
    "vrijwilligers": 46,
    "contributie": 167
  },
  {
    "naam": "Schaatsen Ooststellingwerf 158",
    "gemeente": "Ooststellingwerf",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 52.979708,
    "longitude": 6.254072,
    "leden": 259,
    "vrijwilligers": 30,
    "contributie": 132
  },
  {
    "naam": "Tennis Waadhoeke 159",
    "gemeente": "Waadhoeke",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 53.129221,
    "longitude": 5.561316,
    "leden": 75,
    "vrijwilligers": 14,
    "contributie": 245
  },
  {
    "naam": "Tennis De Fryske Marren 160",
    "gemeente": "De Fryske Marren",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Jeugd",
    "latitude": 52.914803,
    "longitude": 5.683431,
    "leden": 85,
    "vrijwilligers": 16,
    "contributie": 139
  },
  {
    "naam": "Tafeltennis Waadhoeke 161",
    "gemeente": "Waadhoeke",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Gemengd",
    "latitude": 53.269207,
    "longitude": 5.560472,
    "leden": 184,
    "vrijwilligers": 43,
    "contributie": 136
  },
  {
    "naam": "Volleybal Achtkarspelen 162",
    "gemeente": "Achtkarspelen",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 53.278279,
    "longitude": 6.170355,
    "leden": 248,
    "vrijwilligers": 32,
    "contributie": 190
  },
  {
    "naam": "Schaatsen Weststellingwerf 163",
    "gemeente": "Weststellingwerf",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 52.890127,
    "longitude": 5.979511,
    "leden": 161,
    "vrijwilligers": 22,
    "contributie": 177
  },
  {
    "naam": "Schaatsen Opsterland 164",
    "gemeente": "Opsterland",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 52.940277,
    "longitude": 6.12828,
    "leden": 122,
    "vrijwilligers": 21,
    "contributie": 155
  },
  {
    "naam": "Tennis Smallingerland 165",
    "gemeente": "Smallingerland",
    "sportbond": "KNLTB",
    "sport": "Tennis",
    "doelgroep": "Senioren",
    "latitude": 53.104457,
    "longitude": 6.148471,
    "leden": 114,
    "vrijwilligers": 27,
    "contributie": 149
  },
  {
    "naam": "Korfbal Schiermonnikoog 166",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Gemengd",
    "latitude": 53.46744,
    "longitude": 6.182665,
    "leden": 267,
    "vrijwilligers": 23,
    "contributie": 200
  },
  {
    "naam": "Basketbal Schiermonnikoog 167",
    "gemeente": "Schiermonnikoog",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Senioren",
    "latitude": 53.502939,
    "longitude": 6.167663,
    "leden": 140,
    "vrijwilligers": 20,
    "contributie": 195
  },
  {
    "naam": "Korfbal Achtkarspelen 168",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Jeugd",
    "latitude": 53.248624,
    "longitude": 6.078378,
    "leden": 137,
    "vrijwilligers": 19,
    "contributie": 214
  },
  {
    "naam": "Volleybal Weststellingwerf 169",
    "gemeente": "Weststellingwerf",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 52.911297,
    "longitude": 6.02825,
    "leden": 270,
    "vrijwilligers": 63,
    "contributie": 200
  },
  {
    "naam": "Rugby Opsterland 170",
    "gemeente": "Opsterland",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Jeugd",
    "latitude": 53.082831,
    "longitude": 6.101757,
    "leden": 43,
    "vrijwilligers": 5,
    "contributie": 128
  },
  {
    "naam": "Volleybal Dantumadiel 171",
    "gemeente": "Dantumadiel",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.315959,
    "longitude": 5.957556,
    "leden": 130,
    "vrijwilligers": 32,
    "contributie": 93
  },
  {
    "naam": "Handbal Terschelling 172",
    "gemeente": "Terschelling",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Jeugd",
    "latitude": 53.350438,
    "longitude": 5.340118,
    "leden": 151,
    "vrijwilligers": 17,
    "contributie": 191
  },
  {
    "naam": "Volleybal Ameland 173",
    "gemeente": "Ameland",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Jeugd",
    "latitude": 53.43768,
    "longitude": 5.786699,
    "leden": 145,
    "vrijwilligers": 24,
    "contributie": 234
  },
  {
    "naam": "Gymnastiek Vlieland 174",
    "gemeente": "Vlieland",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Gemengd",
    "latitude": 53.313405,
    "longitude": 5.082047,
    "leden": 118,
    "vrijwilligers": 12,
    "contributie": 226
  },
  {
    "naam": "Basketbal Dantumadiel 175",
    "gemeente": "Dantumadiel",
    "sportbond": "NBB",
    "sport": "Basketbal",
    "doelgroep": "Gemengd",
    "latitude": 53.23768,
    "longitude": 5.933935,
    "leden": 113,
    "vrijwilligers": 22,
    "contributie": 188
  },
  {
    "naam": "Tafeltennis Ooststellingwerf 176",
    "gemeente": "Ooststellingwerf",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.065134,
    "longitude": 6.287695,
    "leden": 121,
    "vrijwilligers": 26,
    "contributie": 168
  },
  {
    "naam": "Tafeltennis Ameland 177",
    "gemeente": "Ameland",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Senioren",
    "latitude": 53.466159,
    "longitude": 5.754461,
    "leden": 194,
    "vrijwilligers": 32,
    "contributie": 114
  },
  {
    "naam": "Volleybal Tytsjerksteradiel 178",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Senioren",
    "latitude": 53.294603,
    "longitude": 6.000703,
    "leden": 255,
    "vrijwilligers": 36,
    "contributie": 187
  },
  {
    "naam": "Hockey Heerenveen 179",
    "gemeente": "Heerenveen",
    "sportbond": "KNHB",
    "sport": "Hockey",
    "doelgroep": "Senioren",
    "latitude": 52.993724,
    "longitude": 5.926746,
    "leden": 215,
    "vrijwilligers": 33,
    "contributie": 185
  },
  {
    "naam": "Zwemmen Terschelling 180",
    "gemeente": "Terschelling",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Senioren",
    "latitude": 53.352594,
    "longitude": 5.330799,
    "leden": 300,
    "vrijwilligers": 45,
    "contributie": 121
  },
  {
    "naam": "Schaatsen Dantumadiel 181",
    "gemeente": "Dantumadiel",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.293321,
    "longitude": 5.942724,
    "leden": 189,
    "vrijwilligers": 18,
    "contributie": 205
  },
  {
    "naam": "Atletiek Achtkarspelen 182",
    "gemeente": "Achtkarspelen",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Senioren",
    "latitude": 53.266621,
    "longitude": 6.092016,
    "leden": 167,
    "vrijwilligers": 33,
    "contributie": 156
  },
  {
    "naam": "Voetbal Schiermonnikoog 183",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Senioren",
    "latitude": 53.487914,
    "longitude": 6.182934,
    "leden": 188,
    "vrijwilligers": 45,
    "contributie": 194
  },
  {
    "naam": "Zwemmen Terschelling 184",
    "gemeente": "Terschelling",
    "sportbond": "KNZB",
    "sport": "Zwemmen",
    "doelgroep": "Senioren",
    "latitude": 53.36363,
    "longitude": 5.344347,
    "leden": 217,
    "vrijwilligers": 40,
    "contributie": 192
  },
  {
    "naam": "Honkbal/Softbal Schiermonnikoog 185",
    "gemeente": "Schiermonnikoog",
    "sportbond": "KNBSB",
    "sport": "Honkbal/Softbal",
    "doelgroep": "Gemengd",
    "latitude": 53.465812,
    "longitude": 6.180168,
    "leden": 83,
    "vrijwilligers": 14,
    "contributie": 163
  },
  {
    "naam": "Handbal De Fryske Marren 186",
    "gemeente": "De Fryske Marren",
    "sportbond": "NHV",
    "sport": "Handbal",
    "doelgroep": "Jeugd",
    "latitude": 52.923604,
    "longitude": 5.66025,
    "leden": 139,
    "vrijwilligers": 26,
    "contributie": 165
  },
  {
    "naam": "Voetbal Terschelling 187",
    "gemeente": "Terschelling",
    "sportbond": "KNVB",
    "sport": "Voetbal",
    "doelgroep": "Senioren",
    "latitude": 53.385686,
    "longitude": 5.316007,
    "leden": 194,
    "vrijwilligers": 28,
    "contributie": 167
  },
  {
    "naam": "Schaatsen Harlingen 188",
    "gemeente": "Harlingen",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.135384,
    "longitude": 5.345299,
    "leden": 185,
    "vrijwilligers": 18,
    "contributie": 226
  },
  {
    "naam": "Korfbal Achtkarspelen 189",
    "gemeente": "Achtkarspelen",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Gemengd",
    "latitude": 53.161346,
    "longitude": 6.126368,
    "leden": 235,
    "vrijwilligers": 37,
    "contributie": 229
  },
  {
    "naam": "Schaatsen Ameland 190",
    "gemeente": "Ameland",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Gemengd",
    "latitude": 53.455269,
    "longitude": 5.77916,
    "leden": 192,
    "vrijwilligers": 24,
    "contributie": 136
  },
  {
    "naam": "Korfbal Smallingerland 191",
    "gemeente": "Smallingerland",
    "sportbond": "KNKV",
    "sport": "Korfbal",
    "doelgroep": "Senioren",
    "latitude": 53.159077,
    "longitude": 6.160626,
    "leden": 40,
    "vrijwilligers": 6,
    "contributie": 164
  },
  {
    "naam": "Atletiek Weststellingwerf 192",
    "gemeente": "Weststellingwerf",
    "sportbond": "Atletiekunie",
    "sport": "Atletiek",
    "doelgroep": "Senioren",
    "latitude": 52.801359,
    "longitude": 6.026704,
    "leden": 194,
    "vrijwilligers": 37,
    "contributie": 166
  },
  {
    "naam": "Rugby Weststellingwerf 193",
    "gemeente": "Weststellingwerf",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Gemengd",
    "latitude": 52.815416,
    "longitude": 5.982083,
    "leden": 40,
    "vrijwilligers": 5,
    "contributie": 207
  },
  {
    "naam": "Badminton Waadhoeke 194",
    "gemeente": "Waadhoeke",
    "sportbond": "Badminton Nederland",
    "sport": "Badminton",
    "doelgroep": "Jeugd",
    "latitude": 53.196393,
    "longitude": 5.539604,
    "leden": 175,
    "vrijwilligers": 31,
    "contributie": 160
  },
  {
    "naam": "Schaatsen Waadhoeke 195",
    "gemeente": "Waadhoeke",
    "sportbond": "KNSB",
    "sport": "Schaatsen",
    "doelgroep": "Senioren",
    "latitude": 53.204276,
    "longitude": 5.511394,
    "leden": 148,
    "vrijwilligers": 27,
    "contributie": 149
  },
  {
    "naam": "Tafeltennis Tytsjerksteradiel 196",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.166663,
    "longitude": 5.941025,
    "leden": 157,
    "vrijwilligers": 28,
    "contributie": 98
  },
  {
    "naam": "Gymnastiek Tytsjerksteradiel 197",
    "gemeente": "Tytsjerksteradiel",
    "sportbond": "KNGU",
    "sport": "Gymnastiek",
    "doelgroep": "Jeugd",
    "latitude": 53.183929,
    "longitude": 6.026804,
    "leden": 146,
    "vrijwilligers": 24,
    "contributie": 143
  },
  {
    "naam": "Tafeltennis Waadhoeke 198",
    "gemeente": "Waadhoeke",
    "sportbond": "NTTB",
    "sport": "Tafeltennis",
    "doelgroep": "Jeugd",
    "latitude": 53.269446,
    "longitude": 5.482845,
    "leden": 216,
    "vrijwilligers": 40,
    "contributie": 193
  },
  {
    "naam": "Volleybal Harlingen 199",
    "gemeente": "Harlingen",
    "sportbond": "Nevobo",
    "sport": "Volleybal",
    "doelgroep": "Gemengd",
    "latitude": 53.156057,
    "longitude": 5.433459,
    "leden": 115,
    "vrijwilligers": 17,
    "contributie": 185
  },
  {
    "naam": "Rugby Súdwest-Fryslân 200",
    "gemeente": "Súdwest-Fryslân",
    "sportbond": "NRB",
    "sport": "Rugby",
    "doelgroep": "Senioren",
    "latitude": 53.041827,
    "longitude": 5.654714,
    "leden": 148,
    "vrijwilligers": 14,
    "contributie": 153
  }
];

function saveState(){
  localStorage.setItem('sf_dashboard_state', JSON.stringify({
    theme: AppState.theme
  }));
}
function loadState(){
  try{
    const data = JSON.parse(localStorage.getItem('sf_dashboard_state'));
    if(data && data.theme){
      Object.assign(AppState.theme, data.theme);
      setVar('--brand', AppState.theme.brand);
      setVar('--accent', AppState.theme.accent);
    }
  }catch(e){}
}
loadState();

/** Utils */
function inferSchema(rows){ const s = new Set(); rows.slice(0,50).forEach(r => Object.keys(r).forEach(k => s.add(k))); return Array.from(s); }
function uniqueValues(rows, field){ return Array.from(new Set(rows.map(r => r[field]).filter(v => v!==null && v!==undefined))).sort((a,b)=>(''+a).localeCompare((''+b),'nl')); }
function average(rows, field){ if(!rows.length) return 0; const sum = rows.reduce((a,r)=> a + (typeof r[field]==='number'? r[field]:0), 0); return sum/rows.length; }
function fmtCurrency(v){ return (v||0).toLocaleString('nl-NL', { style:'currency', currency:'EUR', maximumFractionDigits:0 }); }
function formatKPI(v){ if(typeof v==='number'){ if(Number.isInteger(v)) return v.toLocaleString('nl-NL'); return v.toLocaleString('nl-NL',{minimumFractionDigits:1,maximumFractionDigits:1}); } return v; }

function detectDelimiter(header){
  const c = (header.match(/,/g)||[]).length;
  const s = (header.match(/;/g)||[]).length;
  return s > c ? ';' : ',';
}
function splitCSVLine(line, delim){
  const out=[]; let cur=''; let inq=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch === '"'){
      if(inq && line[i+1] === '"'){ cur+='"'; i++; }
      else inq = !inq;
    } else if(ch === delim && !inq){
      out.push(cur); cur='';
    } else { cur+=ch; }
  }
  out.push(cur);
  return out;
}
function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  const headerLine = lines.shift();
  const delim = detectDelimiter(headerLine);
  const headers = splitCSVLine(headerLine, delim).map(h=>h.trim());
  return lines.map(line => {
    const parts = splitCSVLine(line, delim);
    const obj = {};
    headers.forEach((h, i) => {
      let v = parts[i] !== undefined ? parts[i] : '';
      v = v.trim();
      // numeric coercion with NL decimal comma support
      if(v === ''){ obj[h] = null; }
      else if(/^-?\d+,\d+$/.test(v) && !v.includes('.')){ obj[h] = Number(v.replace(',', '.')); }
      else if(!isNaN(Number(v)) && v.trim() !== ''){ obj[h] = Number(v); }
      else if(v.toLowerCase() === 'true'){ obj[h] = true; }
      else if(v.toLowerCase() === 'false'){ obj[h] = false; }
      else { obj[h] = v; }
    });
    return obj;
  });
}

    const obj = {}; headers.forEach((h,i)=>{
      const raw = parts[i] ?? '';
      const n = Number(raw);
      if(raw === '') obj[h] = null;
      else if(!isNaN(n) && raw.trim()!=='') obj[h] = n;
      else if(['true','false'].includes(String(raw).toLowerCase())) obj[h] = String(raw).toLowerCase()==='true';
      else obj[h]=raw;
    });
    out.push(obj);
  }
  return out;
}


function findKeyInsensitive(obj, candidates){
  const keys = Object.keys(obj);
  for(const c of candidates){
    const hit = keys.find(k => k.toLowerCase() === c.toLowerCase());
    if(hit) return hit;
  }
  return null;
}
function normalizeLatLon(rows){
  if(!rows || !rows.length) return { latK: null, lonK: null };
  const sample = rows[0];
  const latK = AppState.mapping.latitude || findKeyInsensitive(sample, ['latitude','lat','y','koord_y','breedtegraad']);
  const lonK = AppState.mapping.longitude || findKeyInsensitive(sample, ['longitude','lon','lng','x','koord_x','lengtegraad']);
  rows.forEach(r => {
    if(latK && typeof r[latK] === 'string' && /^-?\d+,\d+$/.test(r[latK])) r[latK] = Number(r[latK].replace(',','.'));
    if(lonK && typeof r[lonK] === 'string' && /^-?\d+,\d+$/.test(r[lonK])) r[lonK] = Number(r[lonK].replace(',','.'));
  });
  return { latK, lonK };
}

/** Router */
const routes = {
  'dashboard': renderDashboard,
  'compare': renderCompare,
  'map': renderMap,
  'help': renderHelp,
  'settings': renderSettings
};
function titleFor(route){ switch(route){ case 'compare': return 'Vergelijker'; case 'map': return 'Kaart'; case 'help': return 'Uitleg'; case 'settings': return 'Instellingen'; default: return 'Dashboard'; } }
function navigate(){
  const hash = location.hash.replace('#/','') || 'dashboard';
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('data-route')===hash));
  const view = document.getElementById('view'); view.innerHTML='';
  document.getElementById('pageTitle').textContent = titleFor(hash);
  (routes[hash]||renderDashboard)(view);
}
window.addEventListener('hashchange', navigate);

/** File input: only select (pending); separate button loads */
document.addEventListener('DOMContentLoaded', ()=>{
  const fileInput = document.getElementById('fileInput');
  if(fileInput){
    fileInput.addEventListener('change', (e)=>{
      const file = e.target.files[0]; if(!file) return;
      AppState.pendingFile = file; AppState.datasetName = file.name;
      const ds = document.querySelector('.dataset-name'); if(ds) ds.textContent = file.name + ' (klaar om te laden)';
    });
  }
  document.getElementById('resetApp').addEventListener('click', ()=>{ localStorage.removeItem('sf_dashboard_state'); location.reload(); });
});

/** Dropdown filters */
const FixedFilters = { gemeente:null, sportbond:null, sport:null, doelgroep:null };
function buildDropdownFilters(){
  const src = AppState.rows.length ? AppState.rows : DummyRows;
  const setSel = (id, field)=>{
    const el = document.getElementById(id); if(!el) return;
    const keep = el.value;
    el.innerHTML=''; const a=document.createElement('option'); a.value=''; a.textContent='(Alle)'; el.appendChild(a);
    uniqueValues(src, field).forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; el.appendChild(o); });
    if(keep && Array.from(el.options).some(o=>o.value===keep)) el.value=keep;
  };
  setSel('ff_gemeente','gemeente'); setSel('ff_sportbond','sportbond'); setSel('ff_sport','sport'); setSel('ff_doelgroep','doelgroep');
}
function applyDropdownFilters(){
  const src = AppState.rows.length ? AppState.rows : DummyRows;
  AppState.filtered = src.filter(r => (!FixedFilters.gemeente || r.gemeente===FixedFilters.gemeente)
    && (!FixedFilters.sportbond || r.sportbond===FixedFilters.sportbond)
    && (!FixedFilters.sport || r.sport===FixedFilters.sport)
    && (!FixedFilters.doelgroep || r.doelgroep===FixedFilters.doelgroep));
}


function titleSuffix(){
  const parts = [];
  if(FixedFilters.gemeente) parts.push(FixedFilters.gemeente);
  if(FixedFilters.sportbond) parts.push(FixedFilters.sportbond);
  if(FixedFilters.sport) parts.push(FixedFilters.sport);
  if(FixedFilters.doelgroep) parts.push(FixedFilters.doelgroep);
  return parts.length ? ' - ' + parts.join(' - ') : '';
}


function titleSuffix(){
  const parts = [];
  if(FixedFilters.gemeente) parts.push(FixedFilters.gemeente);
  if(FixedFilters.sportbond) parts.push(FixedFilters.sportbond);
  if(FixedFilters.sport) parts.push(FixedFilters.sport);
  if(FixedFilters.doelgroep) parts.push(FixedFilters.doelgroep);
  return parts.length ? ' - ' + parts.join(' - ') : '';
}
function updateKpiTitle(){
  const el = document.getElementById('kpiTitle');
  if(el){ el.textContent = 'Kerncijfers' + titleSuffix(); }
}

/** Dashboard */
async function loadSelectedFile(){
  const file = AppState.pendingFile;
  if(!file){ alert('Kies eerst een bestand.'); return; }
  if(file.name.toLowerCase().endsWith('.csv')){
    const text = await file.text(); AppState.rows = parseCSV(text);
  }else{
    const data = await file.arrayBuffer(); const wb = XLSX.read(data,{type:'array'}); const ws = wb.Sheets[wb.SheetNames[0]];
    AppState.rows = XLSX.utils.sheet_to_json(ws,{defval:null});
  }
  AppState.schema = inferSchema(AppState.rows); AppState.usingDummy = false; AppState.filters=[]; normalizeLatLon(AppState.rows); applyDropdownFilters(); buildDropdownFilters(); navigate(); updateKpiTitle();
}

function renderDashboard(mount){
  if(!AppState.rows.length && AppState.usingDummy){
    AppState.rows = DummyRows.slice(); AppState.schema = inferSchema(AppState.rows); buildDropdownFilters(); applyDropdownFilters();
  }

  // Controls card
  const card1 = document.createElement('div'); card1.className='card stack';
  const head = document.createElement('div'); head.className='section-title'; head.textContent='Data & Filters'; card1.appendChild(head);
  const ctl = document.createElement('div'); ctl.className='flex';
  const pick = document.createElement('button'); pick.className='btn'; pick.textContent='Kies bestand'; pick.addEventListener('click', ()=> document.getElementById('fileInput').click());
  const load = document.createElement('button'); load.className='btn'; load.textContent='Laad dataset'; load.addEventListener('click', loadSelectedFile);
  const useDummy = document.createElement('button'); useDummy.className='btn btn-ghost'; useDummy.textContent='Gebruik dummy data';
  useDummy.addEventListener('click', ()=>{ AppState.rows = DummyRows.slice(); AppState.schema=inferSchema(AppState.rows); AppState.usingDummy=true; normalizeLatLon(AppState.rows); buildDropdownFilters(); applyDropdownFilters(); navigate(); });
  const name = document.createElement('div'); name.style.marginLeft='8px'; name.style.color='var(--muted)'; name.textContent = AppState.datasetName || 'Geen dataset geladen';
  ctl.appendChild(pick); ctl.appendChild(load); ctl.appendChild(useDummy); ctl.appendChild(name);
  card1.appendChild(ctl);

  const filterRow = document.createElement('div'); filterRow.className='filter-row';
  const mk = (label,id)=>{ const g=document.createElement('div'); g.className='group'; const l=document.createElement('div'); l.className='label-sm'; l.textContent=label; const s=document.createElement('select'); s.id=id; s.addEventListener('change',()=>{ FixedFilters[id.split('_')[1]]= s.value||null; applyDropdownFilters(); updateKpiTitle(); renderGrid(); }); g.appendChild(l); g.appendChild(s); return g; };
  filterRow.appendChild(mk('Gemeente','ff_gemeente'));
  filterRow.appendChild(mk('Sportbond','ff_sportbond'));
  filterRow.appendChild(mk('Sport','ff_sport'));
  filterRow.appendChild(mk('Doelgroep','ff_doelgroep'));
  card1.appendChild(filterRow);

  const reset = document.createElement('button'); reset.className='btn btn-ghost'; reset.textContent='Wis filters';
  reset.addEventListener('click', ()=>{ Object.keys(FixedFilters).forEach(k=>FixedFilters[k]=null); ['ff_gemeente','ff_sportbond','ff_sport','ff_doelgroep'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); applyDropdownFilters(); updateKpiTitle(); renderGrid(); });
  card1.appendChild(reset);

  mount.appendChild(card1);

  // KPI grid card
  const card2 = document.createElement('div'); card2.className='card';
  const t2 = document.createElement('div'); t2.className='section-title'; t2.id='kpiTitle'; t2.textContent='Kerncijfers'; card2.appendChild(t2);
  const grid = document.createElement('div'); grid.className='tile-grid fixed-4'; grid.id='kpiGrid'; card2.appendChild(grid);
  mount.appendChild(card2);

  buildDropdownFilters();
  updateKpiTitle();
  renderGrid();

  function renderGrid(){
    updateKpiTitle();
    const titleEl = document.getElementById('kpiTitle'); if(titleEl) titleEl.textContent = 'Kerncijfers' + titleSuffix();
    applyDropdownFilters();
    const total = (AppState.rows.length||0);
    const rows = AppState.filtered;
    const current = rows.length||0;
    const sum = (rows, f)=> rows.reduce((a,r)=> a + (typeof r[f]==='number'? r[f]:0), 0);
    const uniq = (rows, f)=> new Set(rows.map(r=> r[f]).filter(Boolean)).size;
    const pct = (a,b)=> b? Math.round((a/b)*1000)/10 : 0;
    const ledenTot = sum(rows,'leden'); const vrijTot = sum(rows,'vrijwilligers');
    const gemLeden = current ? Math.round(ledenTot/current) : 0;
    const vrijPer100 = ledenTot ? Math.round((vrijTot/ledenTot)*1000)/10 : 0;
    const hasLoc = rows.filter(r=> isFinite(Number(r.latitude)) && isFinite(Number(r.longitude))).length;
    const avgContrib = Math.round(average(rows,'contributie'));
    const maxV = rows.slice().sort((a,b)=> (b.leden||0)-(a.leden||0))[0];

    const tiles = [
      { label:'Verenigingen (selectie)', value: current },
      { label:'Totaal leden', value: ledenTot },
      { label:'Gem. leden per vereniging', value: gemLeden },
      { label:'Vrijwilligers totaal', value: vrijTot },

      { label:'Vrijwilligers per 100 leden', value: vrijPer100 },
      { label:'Unieke sporten', value: uniq(rows,'sport') },
      { label:'Unieke sportbonden', value: uniq(rows,'sportbond') },
      { label:'Unieke gemeenten', value: uniq(rows,'gemeente') },

      { label:'Met locatie', value: pct(hasLoc,current)+'%', sub: `${hasLoc}/${current}` },
      { label:'Gem. contributie', value: fmtCurrency(avgContrib) },
      { label:'Selectie / Totaal', xofy: `${current}/${total}`, sub: `${pct(current,total)}%` },
      { label:'Meeste leden (vereniging)', value: maxV? maxV.leden:0, sub: maxV? maxV.naam:'—' }
    ];

    const grid = document.getElementById('kpiGrid'); grid.innerHTML='';
    tiles.forEach(t => {
      const d = document.createElement('div'); d.className='tile equal';
      if(t.xofy){
        d.innerHTML = `<div class="kpi-xofy">${t.xofy}</div><div class="label">${t.label}</div>${t.sub? `<div class="sub">${t.sub}</div>`:''}`;
      }else{
        d.innerHTML = `<div class="kpi kpi-metric">${formatKPI(t.value)}</div><div class="label">${t.label}</div>${t.sub? `<div class="sub">${t.sub}</div>`:''}`;
      }
      grid.appendChild(d);
    });
  }
}

/** Compare */
function renderCompare(mount){
  const card = document.createElement('div'); card.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Vergelijker'; card.appendChild(title);
  const p = document.createElement('div'); p.textContent = 'Coming soon: Gebruik filters links in Dashboard voor nu. (Functionaliteit blijft behouden.)';
  card.appendChild(p); mount.appendChild(card);
}


/** --- Boundaries helpers --- */
function getGemeenteName(props){
  // Try common keys used by PDOK/CBS datasets
  const keys = ['GM_NAAM','Gemeentenaam','gemeentenaam','gemeente','name','NAAM'];
  for(const k of keys){
    if(props && props[k] != null) return String(props[k]);
  }
  return null;
}

/** Map */
function renderMap(mount){
  const wrapper = document.createElement('div'); wrapper.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.id='mapTitle'; title.textContent='Kaart' + titleSuffix(); wrapper.appendChild(title);
  const mapCount = document.createElement('div'); mapCount.className='sub'; mapCount.id='mapCount'; wrapper.appendChild(mapCount);
  const mapWrap = document.createElement('div'); mapWrap.className='tile equal'; mapWrap.style.height='64vh'; mapWrap.id='map'; wrapper.appendChild(mapWrap);
    const hard = document.createElement('button'); hard.className='btn btn-ghost'; hard.textContent='Volledige reset (cache & instellingen)'; hard.addEventListener('click', ()=>{ localStorage.clear(); location.reload(); }); wrapper.appendChild(hard);
  mount.appendChild(wrapper);

  // Ensure data exists and apply active dropdown filters from dashboard
  if(!AppState.rows.length && AppState.usingDummy){
    AppState.rows = DummyRows.slice(); AppState.schema = inferSchema(AppState.rows);
  }
  applyDropdownFilters(); // sets AppState.filtered based on FixedFilters
  const rows = AppState.filtered && AppState.filtered.length ? AppState.filtered : [];

  const map = L.map('map').setView([53.1,5.8], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);

  const pts = rows.map(r => ({lat:Number(r.latitude), lon:Number(r.longitude), name:r.naam})).filter(p => isFinite(p.lat)&&isFinite(p.lon));

  const countEl = document.getElementById('mapCount'); if(countEl){ countEl.textContent = `${pts.length} locaties gevonden`; }

  if(!pts.length){
    const empty = L.popup({ closeButton:false, autoClose:false }).setLatLng([53.2,5.8]).setContent('Geen resultaten met deze filters').openOn(map);
    return;
  }

  const markers = [];
  pts.forEach(p =>{ const m=L.marker([p.lat,p.lon]).addTo(map); m.bindPopup(buildPopup(p.row), {maxWidth: 360}); markers.push(m); });
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.25));
}


/** Popup content for map markers: show all available fields for the club */
function buildPopup(row){
  const order = ['naam','gemeente','sportbond','sport','doelgroep','leden','vrijwilligers','contributie','latitude','longitude'];
  const seen = new Set();
  const rows = [];
  // Known fields first in a friendly order
  order.forEach(k => {
    if(row[k] !== undefined && row[k] !== null && row[k] !== ''){
      let val = row[k];
      if(k === 'contributie' && typeof val === 'number'){ val = fmtCurrency(val); }
      if((k === 'latitude' || k === 'longitude') && typeof val === 'number'){ val = Number(val).toFixed(5); }
      rows.push([k, val]); seen.add(k);
    }
  });
  // Then any other fields dynamically
  Object.keys(row).forEach(k => {
    if(!seen.has(k) && row[k] !== null && row[k] !== ''){
      let val = row[k];
      if(typeof val === 'number' && !Number.isInteger(val)){
        val = Number(val).toLocaleString('nl-NL', {maximumFractionDigits:2});
      }
      rows.push([k, val]);
    }
  });
  // Derived metric example
  if(row.leden && row.vrijwilligers){
    const per100 = Math.round((row.vrijwilligers / row.leden) * 1000) / 10;
    rows.push(['vrijwilligers_per_100_leden', per100]);
  }
  // Build HTML
  const title = (row.naam ?? 'Vereniging');
  const items = rows.map(([k,v]) => `<div class="pp-row"><div class="pp-k">${k}</div><div class="pp-v">${v}</div></div>`).join('');
  return `<div class="pp-wrap">
    <div class="pp-title">${title}</div>
    <div class="pp-list">${items}</div>
  </div>`;
}

/** Help */
function renderHelp(mount){
  const card = document.createElement('div'); card.className='card stack';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Uitleg'; card.appendChild(title);
  const p = document.createElement('div'); p.innerHTML = '<p>Gebruik <strong>Kies bestand</strong> en daarna <strong>Laad dataset</strong> om data zichtbaar te maken. Pas vervolgens de 4 filters toe om de tegels te sturen. Alles draait lokaal in je browser.</p>'; card.appendChild(p);
  mount.appendChild(card);
}

/** Settings */
function renderSettings(mount){
  const wrapper = document.createElement('div'); wrapper.className='card stack';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Instellingen'; wrapper.appendChild(title);
  const theme = document.createElement('div'); theme.className='flex';
  const inBrand = document.createElement('input'); inBrand.type='color'; inBrand.value=getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()||'#212945';
  const inAccent = document.createElement('input'); inAccent.type='color'; inAccent.value=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#52E8E8';
  const save = document.createElement('button'); save.className='btn'; save.textContent='Opslaan';
  save.addEventListener('click', ()=>{ document.documentElement.style.setProperty('--brand', inBrand.value); document.documentElement.style.setProperty('--accent', inAccent.value); AppState.theme.brand=inBrand.value; AppState.theme.accent=inAccent.value; saveState(); alert('Instellingen opgeslagen ✅'); });
  theme.append('Merk-kleur', inBrand, 'Accent-kleur', inAccent, save); wrapper.appendChild(theme);
    const hard = document.createElement('button'); hard.className='btn btn-ghost'; hard.textContent='Volledige reset (cache & instellingen)'; hard.addEventListener('click', ()=>{ localStorage.clear(); location.reload(); }); wrapper.appendChild(hard);
  mount.appendChild(wrapper);
}

/** Boot */
navigate();