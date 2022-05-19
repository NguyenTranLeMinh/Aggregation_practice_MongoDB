/*https://stackoverflow.com/questions/44481283/how-to-implement-bucket-to-group-by-multiple-fields*/
db.people.aggregate
(
	[ 
		{$group:
			{
				_id: {
					country: '$address.country',
					ageRange: 
					{
						$let: 
						{
							vars: {age: {$dateDiff: 
											{
												startDate: '$birthDate',
												endDate: ISODate('2016-06-22'),
												unit: 'year'
											}
										}
							},
							in: {
								$switch: {
									branches: [
										{case: {$and: [{$gte: ['$$age',18]},{$lt: ['$$age',30]}]},then: '18-29'},
										{case: {$and: [{$gte: ['$$age',30]},{$lt: ['$$age',40]}]},then: '30-39'},
										{case: {$and: [{$gte: ['$$age',40]},{$lt: ['$$age',50]}]},then: '40-49'}
									],
									default: 'Other'
								}
							}
						}
					}
				},
				count: {$sum: 1}
			}
		},
		{$sort: {'_id.ageRange': 1}},
		/*Add new column 'matched' to filter*/
		{$project: 
			{
				_id: 1,
				count: 1,
				matched: {$ne: ['$_id.ageRange','Other']}
			}
		},
		{$match: {matched: true}},
		{$project: 
			{
				_id: 1,
				count: 1
			}
		}
	]
)
