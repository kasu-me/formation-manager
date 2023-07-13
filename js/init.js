//データ入力
minYearMonth = new YearMonth(1960, 1);
maxYearMonth = new YearMonth(2020, 12);
now.updateByYearMonth(minYearMonth);

AllSerieses.addSeries(new Series("1000系", "西武601系", "あああ"));
AllSerieses.addSeries(new Series("1400系", "西武411系", "いいい"));
AllSerieses.addSeries(new Series("E233系", "西武411系", "ううう"));

AllFormationTemplates.addFormationTemplate(new FormationTemplate(0, "4両編成", [n => 1000 + n, n => 1100 + n, n => 1200 + n, n => 1300 + n]));
AllFormationTemplates.addFormationTemplate(new FormationTemplate(0, "4両編成50番台", [n => 1050 + n, n => 1150 + n, n => 1250 + n, n => 1350 + n]));
AllFormationTemplates.addFormationTemplate(new FormationTemplate(1, "3両編成", [n => 1400 + (n * 2 - 1), n => 1400 + (n * 2), n => 1500 + (n * 2 - 1)]));
AllFormationTemplates.addFormationTemplate(new FormationTemplate(1, "3両編成50番台", [1450, 1550, 1650]));
AllFormationTemplates.addFormationTemplate(new FormationTemplate(2, "10両編成", [n => `クハE233-${n}`, n => `モハE233-${n}`, n => `モハE232-${n}`, n => `サハE233-${500 + n}`, n => `モハE233-${200 + n}`, n => `モハE232-${200 + n}`, n => `サハE233-${n}`, n => `モハE233-${400 + n}`, n => `モハE232-${400 + n}`, n => `クハE232-${n}`], (n) => `T${n}編成`));

AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(0), 1, "本線");
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(0), 2);
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(1), 1, "", new YearMonth(1965, 3));
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(1), 2, "", new YearMonth(1965, 4));
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(1), 3, "", new YearMonth(1965, 5));
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(0), 3, "", new YearMonth(1965, 6));
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 1);
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 2);
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 3);
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(2), 4);
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(3), 6, "", new YearMonth(1980, 2));
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(4), 1, "本線");
AllFormations.addFormationFromTemplate(AllCars, AllFormationTemplates.getFormationTemplate(4), 2, "本線");
AllCars.addCar(new Car(1091, new YearMonth(1960, 1)));
AllCars.addCar(new Car(1092, new YearMonth(1960, 1)));
AllCars.addCar(new Car(1093, new YearMonth(1961, 6)));