//データ入力
minYearMonth = new YearMonth(1960, 1);
maxYearMonth = new YearMonth(2020, 12);
now = minYearMonth;

serieses.addSeries(new Series("1000系", "西武601系", "あああ"));
serieses.addSeries(new Series("1400系", "西武411系", "いいい"));

formationTemplates.addFormationTemplate(new FormationTemplate(0, [n => 1000 + n, n => 1100 + n, n => 1200 + n, n => 1300 + n]));
formationTemplates.addFormationTemplate(new FormationTemplate(0, [n => 1050 + n, n => 1150 + n, n => 1250 + n, n => 1350 + n]));
formationTemplates.addFormationTemplate(new FormationTemplate(1, [n => 1400 + (n * 2 - 1), n => 1400 + (n * 2), n => 1500 + (n * 2 - 1)]));
formationTemplates.addFormationTemplate(new FormationTemplate(1, [1450, 1550, 1650]));

formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(0),1,"本線");
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(0),2);
formations.addFormationFromTemplate(cars, formationTemplates.getFormationTemplate(1), 1,"",new YearMonth(1965,3));
formations.addFormationFromTemplate(cars, formationTemplates.getFormationTemplate(1), 2,"",new YearMonth(1965,4));
formations.addFormationFromTemplate(cars, formationTemplates.getFormationTemplate(1), 3,"",new YearMonth(1965,5));
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(0),3,"", new YearMonth(1965,6));
cars.addCar(new Car(256,new YearMonth(1970,6)));
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(2),1);
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(2),2);
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(2),3);
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(2),4);
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(3),6,"",new YearMonth(1980,2));
formations.addFormationFromTemplate(cars,formationTemplates.getFormationTemplate(0),6,"本線");