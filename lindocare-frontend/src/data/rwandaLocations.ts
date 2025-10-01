export interface Village {
  id: string;
  name: string;
}

export interface Cell {
  id: string;
  name: string;
  villages: Village[];
}

export interface Sector {
  id: string;
  name: string;
  cells: Cell[];
}

export interface District {
  id: string;
  name: string;
  sectors: Sector[];
}

export interface Province {
  id: string;
  name: string;
  districts: District[];
}

export const rwandaLocations: Province[] = [
  {
    id: "kigali",
    name: "Kigali City",
    districts: [
      {
        id: "gasabo",
        name: "Gasabo",
        sectors: [
          {
            id: "bumbogo",
            name: "Bumbogo",
            cells: [
              {
                id: "bumbogo_cell",
                name: "Bumbogo",
                villages: [
                  { id: "gitega", name: "Gitega" },
                  { id: "nyabisindu", name: "Nyabisindu" },
                  { id: "rutunga", name: "Rutunga" }
                ]
              }
            ]
          },
          {
            id: "gatsata",
            name: "Gatsata",
            cells: [
              {
                id: "gatsata_cell",
                name: "Gatsata",
                villages: [
                  { id: "gatsata_village", name: "Gatsata" },
                  { id: "karuruma", name: "Karuruma" }
                ]
              }
            ]
          },
          {
            id: "jali",
            name: "Jali",
            cells: [
              {
                id: "jali_cell",
                name: "Jali",
                villages: [
                  { id: "jali_village", name: "Jali" },
                  { id: "rusororo", name: "Rusororo" }
                ]
              }
            ]
          },
          {
            id: "kimironko",
            name: "Kimironko",
            cells: [
              {
                id: "bibare",
                name: "Bibare",
                villages: [
                  { id: "bibare_village", name: "Bibare" },
                  { id: "kabuga", name: "Kabuga" }
                ]
              },
              {
                id: "kibagabaga",
                name: "Kibagabaga",
                villages: [
                  { id: "kibagabaga_village", name: "Kibagabaga" },
                  { id: "nyagatovu", name: "Nyagatovu" }
                ]
              }
            ]
          },
          {
            id: "kinyinya",
            name: "Kinyinya",
            cells: [
              {
                id: "kinyinya_cell",
                name: "Kinyinya",
                villages: [
                  { id: "kinyinya_village", name: "Kinyinya" },
                  { id: "kagugu", name: "Kagugu" }
                ]
              }
            ]
          },
          {
            id: "ndera",
            name: "Ndera",
            cells: [
              {
                id: "ndera_cell",
                name: "Ndera",
                villages: [
                  { id: "ndera_village", name: "Ndera" },
                  { id: "rushashi", name: "Rushashi" }
                ]
              }
            ]
          },
          {
            id: "nduba",
            name: "Nduba",
            cells: [
              {
                id: "nduba_cell",
                name: "Nduba",
                villages: [
                  { id: "nduba_village", name: "Nduba" },
                  { id: "masaka", name: "Masaka" }
                ]
              }
            ]
          },
          {
            id: "remera",
            name: "Remera",
            cells: [
              {
                id: "gishushu",
                name: "Gishushu",
                villages: [
                  { id: "gishushu_village", name: "Gishushu" },
                  { id: "rwandex", name: "Rwandex" },
                  { id: "gacuriro", name: "Gacuriro" }
                ]
              },
              {
                id: "remera_cell",
                name: "Remera",
                villages: [
                  { id: "remera_village", name: "Remera" },
                  { id: "kisimenti", name: "Kisimenti" },
                  { id: "kimihurura", name: "Kimihurura" }
                ]
              },
              {
                id: "rukiri",
                name: "Rukiri",
                villages: [
                  { id: "rukiri_village", name: "Rukiri" },
                  { id: "karembure", name: "Karembure" }
                ]
              }
            ]
          },
          {
            id: "rusororo",
            name: "Rusororo",
            cells: [
              {
                id: "rusororo_cell",
                name: "Rusororo",
                villages: [
                  { id: "rusororo_village", name: "Rusororo" },
                  { id: "rwimbogo", name: "Rwimbogo" }
                ]
              },
              {
                id: "kabuga",
                name: "Kabuga",
                villages: [
                  { id: "kabuga_village", name: "Kabuga" },
                  { id: "gahanga", name: "Gahanga" }
                ]
              }
            ]
          },
          {
            id: "gikomero",
            name: "Gikomero",
            cells: [
              {
                id: "gikomero_cell",
                name: "Gikomero",
                villages: [
                  { id: "gikomero_village", name: "Gikomero" },
                  { id: "cyeru", name: "Cyeru" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "kicukiro",
        name: "Kicukiro",
        sectors: [
          {
            id: "gahanga",
            name: "Gahanga",
            cells: [
              {
                id: "gahanga_cell",
                name: "Gahanga",
                villages: [
                  { id: "gahanga_village", name: "Gahanga" },
                  { id: "busanza", name: "Busanza" },
                  { id: "rebero", name: "Rebero" }
                ]
              },
              {
                id: "karembure",
                name: "Karembure",
                villages: [
                  { id: "karembure_village", name: "Karembure" },
                  { id: "gaseke", name: "Gaseke" }
                ]
              }
            ]
          },
          {
            id: "gatenga",
            name: "Gatenga",
            cells: [
              {
                id: "gatenga_cell",
                name: "Gatenga",
                villages: [
                  { id: "gatenga_village", name: "Gatenga" },
                  { id: "kagarama", name: "Kagarama" },
                  { id: "kabeza", name: "Kabeza" }
                ]
              },
              {
                id: "kigarama",
                name: "Kigarama",
                villages: [
                  { id: "kigarama_village", name: "Kigarama" },
                  { id: "kimironko", name: "Kimironko" }
                ]
              }
            ]
          },
          {
            id: "gikondo",
            name: "Gikondo",
            cells: [
              {
                id: "gikondo_cell",
                name: "Gikondo",
                villages: [
                  { id: "gikondo_village", name: "Gikondo" },
                  { id: "sonatube", name: "Sonatube" },
                  { id: "nyenyeri", name: "Nyenyeri" }
                ]
              },
              {
                id: "nyanza",
                name: "Nyanza",
                villages: [
                  { id: "nyanza_village", name: "Nyanza" },
                  { id: "rilima", name: "Rilima" }
                ]
              }
            ]
          },
          {
            id: "kagarama",
            name: "Kagarama",
            cells: [
              {
                id: "kagarama_cell",
                name: "Kagarama",
                villages: [
                  { id: "kagarama_village", name: "Kagarama" },
                  { id: "nyanza", name: "Nyanza" }
                ]
              }
            ]
          },
          {
            id: "kanombe",
            name: "Kanombe",
            cells: [
              {
                id: "kanombe_cell",
                name: "Kanombe",
                villages: [
                  { id: "kanombe_village", name: "Kanombe" },
                  { id: "zindiro", name: "Zindiro" }
                ]
              }
            ]
          },
          {
            id: "kicukiro_sector",
            name: "Kicukiro",
            cells: [
              {
                id: "kicukiro_cell",
                name: "Kicukiro",
                villages: [
                  { id: "kicukiro_village", name: "Kicukiro" },
                  { id: "nyarugunga", name: "Nyarugunga" }
                ]
              }
            ]
          },
          {
            id: "niboye",
            name: "Niboye",
            cells: [
              {
                id: "niboye_cell",
                name: "Niboye",
                villages: [
                  { id: "niboye_village", name: "Niboye" },
                  { id: "kagunga", name: "Kagunga" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "nyarugenge",
        name: "Nyarugenge",
        sectors: [
          {
            id: "gitega",
            name: "Gitega",
            cells: [
              {
                id: "gitega_cell",
                name: "Gitega",
                villages: [
                  { id: "gitega_village", name: "Gitega" },
                  { id: "rugarama", name: "Rugarama" }
                ]
              }
            ]
          },
          {
            id: "kanyinya",
            name: "Kanyinya",
            cells: [
              {
                id: "kanyinya_cell",
                name: "Kanyinya",
                villages: [
                  { id: "kanyinya_village", name: "Kanyinya" },
                  { id: "cyahafi", name: "Cyahafi" }
                ]
              }
            ]
          },
          {
            id: "kigali",
            name: "Kigali",
            cells: [
              {
                id: "gisozi",
                name: "Gisozi",
                villages: [
                  { id: "gisozi_village", name: "Gisozi" },
                  { id: "rwampara", name: "Rwampara" }
                ]
              },
              {
                id: "kimisagara",
                name: "Kimisagara",
                villages: [
                  { id: "kimisagara_village", name: "Kimisagara" },
                  { id: "nyamirambo", name: "Nyamirambo" }
                ]
              }
            ]
          },
          {
            id: "kimisagara",
            name: "Kimisagara",
            cells: [
              {
                id: "kimisagara_sector_cell",
                name: "Kimisagara",
                villages: [
                  { id: "kimisagara_sector_village", name: "Kimisagara" },
                  { id: "biryogo", name: "Biryogo" }
                ]
              }
            ]
          },
          {
            id: "mageragere",
            name: "Mageragere",
            cells: [
              {
                id: "mageragere_cell",
                name: "Mageragere",
                villages: [
                  { id: "mageragere_village", name: "Mageragere" },
                  { id: "nyabugogo", name: "Nyabugogo" }
                ]
              }
            ]
          },
          {
            id: "muhima",
            name: "Muhima",
            cells: [
              {
                id: "muhima_cell",
                name: "Muhima",
                villages: [
                  { id: "muhima_village", name: "Muhima" },
                  { id: "rugenge", name: "Rugenge" }
                ]
              }
            ]
          },
          {
            id: "nyamirambo",
            name: "Nyamirambo",
            cells: [
              {
                id: "nyamirambo_cell",
                name: "Nyamirambo",
                villages: [
                  { id: "nyamirambo_village", name: "Nyamirambo" },
                  { id: "cyivugiza", name: "Cyivugiza" }
                ]
              }
            ]
          },
          {
            id: "nyarugenge_sector",
            name: "Nyarugenge",
            cells: [
              {
                id: "nyarugenge_cell",
                name: "Nyarugenge",
                villages: [
                  { id: "nyarugenge_village", name: "Nyarugenge" },
                  { id: "rwezamenyo", name: "Rwezamenyo" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "southern",
    name: "Southern Province",
    districts: [
      {
        id: "gisagara",
        name: "Gisagara",
        sectors: [
          {
            id: "gishubi",
            name: "Gishubi",
            cells: [
              {
                id: "gishubi_cell",
                name: "Gishubi",
                villages: [
                  { id: "gishubi_village", name: "Gishubi" },
                  { id: "nyarurama", name: "Nyarurama" }
                ]
              }
            ]
          },
          {
            id: "kansi",
            name: "Kansi",
            cells: [
              {
                id: "kansi_cell",
                name: "Kansi",
                villages: [
                  { id: "kansi_village", name: "Kansi" },
                  { id: "rweru", name: "Rweru" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "huye",
        name: "Huye",
        sectors: [
          {
            id: "huye_sector",
            name: "Huye",
            cells: [
              {
                id: "huye_cell",
                name: "Huye",
                villages: [
                  { id: "huye_village", name: "Huye" },
                  { id: "matyazo", name: "Matyazo" }
                ]
              }
            ]
          },
          {
            id: "tumba",
            name: "Tumba",
            cells: [
              {
                id: "tumba_cell",
                name: "Tumba",
                villages: [
                  { id: "tumba_village", name: "Tumba" },
                  { id: "cyarwa", name: "Cyarwa" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "northern",
    name: "Northern Province",
    districts: [
      {
        id: "musanze",
        name: "Musanze",
        sectors: [
          {
            id: "busogo",
            name: "Busogo",
            cells: [
              {
                id: "busogo_cell",
                name: "Busogo",
                villages: [
                  { id: "busogo_village", name: "Busogo" },
                  { id: "cyuve", name: "Cyuve" }
                ]
              }
            ]
          },
          {
            id: "cyuve",
            name: "Cyuve",
            cells: [
              {
                id: "cyuve_cell",
                name: "Cyuve",
                villages: [
                  { id: "cyuve_village", name: "Cyuve" },
                  { id: "kinigi", name: "Kinigi" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "eastern",
    name: "Eastern Province",
    districts: [
      {
        id: "rwamagana",
        name: "Rwamagana",
        sectors: [
          {
            id: "fumbwe",
            name: "Fumbwe",
            cells: [
              {
                id: "fumbwe_cell",
                name: "Fumbwe",
                villages: [
                  { id: "fumbwe_village", name: "Fumbwe" },
                  { id: "gahini", name: "Gahini" }
                ]
              }
            ]
          },
          {
            id: "gahengeri",
            name: "Gahengeri",
            cells: [
              {
                id: "gahengeri_cell",
                name: "Gahengeri",
                villages: [
                  { id: "gahengeri_village", name: "Gahengeri" },
                  { id: "munyaga", name: "Munyaga" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "western",
    name: "Western Province",
    districts: [
      {
        id: "rubavu",
        name: "Rubavu",
        sectors: [
          {
            id: "gisenyi",
            name: "Gisenyi",
            cells: [
              {
                id: "gisenyi_cell",
                name: "Gisenyi",
                villages: [
                  { id: "gisenyi_village", name: "Gisenyi" },
                  { id: "pfunda", name: "Pfunda" }
                ]
              }
            ]
          },
          {
            id: "kanama",
            name: "Kanama",
            cells: [
              {
                id: "kanama_cell",
                name: "Kanama",
                villages: [
                  { id: "kanama_village", name: "Kanama" },
                  { id: "mudende", name: "Mudende" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper functions
export const getProvinces = (): Province[] => rwandaLocations;

export const getDistrictsByProvince = (provinceId: string): District[] => {
  const province = rwandaLocations.find(p => p.id === provinceId);
  return province ? province.districts : [];
};

export const getSectorsByDistrict = (provinceId: string, districtId: string): Sector[] => {
  const province = rwandaLocations.find(p => p.id === provinceId);
  if (!province) return [];
  const district = province.districts.find(d => d.id === districtId);
  return district ? district.sectors : [];
};

export const getCellsBySector = (provinceId: string, districtId: string, sectorId: string): Cell[] => {
  const province = rwandaLocations.find(p => p.id === provinceId);
  if (!province) return [];
  const district = province.districts.find(d => d.id === districtId);
  if (!district) return [];
  const sector = district.sectors.find(s => s.id === sectorId);
  return sector ? sector.cells : [];
};

export const getVillagesByCell = (provinceId: string, districtId: string, sectorId: string, cellId: string): Village[] => {
  const province = rwandaLocations.find(p => p.id === provinceId);
  if (!province) return [];
  const district = province.districts.find(d => d.id === districtId);
  if (!district) return [];
  const sector = district.sectors.find(s => s.id === sectorId);
  if (!sector) return [];
  const cell = sector.cells.find(c => c.id === cellId);
  return cell ? cell.villages : [];
};
