export default function defaultQueryConfig(id) {
  return {
    id,
    database: null,
    measurement: null,
    retentionPolicy: null,
    fields: [],
    tags: {},
    groupBy: {
      time: null,
      tags: [],
    },
    areTagsAccepted: true,
    rawText: null,
    every: "1m",
    date_range_from: "8",
    date_range_to: "20",
  };
}
