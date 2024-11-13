const { poolPromise, mssql } = require('../config/dbConfig');
const { validateTableName } = require('./utils');

const getSearchData = async (req, res) => {
    const { tableName } = req.params;
    const searchQuery = req.query.query;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!tableName || !searchQuery) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await validateTableName(tableName);

        const pool = await poolPromise;
        const request = pool.request();

        const columnsResult = await request.query(
            `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`
        );
        const columns = columnsResult.recordset.map((row) => row.COLUMN_NAME);

        const isNumericQuery = !isNaN(Number(searchQuery));

        // const isDateQuery = !isNaN(Date.parse(searchQuery));
        // const dateQuery = new Date(searchQuery);
        // const isDateQuery = !isNaN(dateQuery.getTime());

        // Declare variables for year, month, and day
        let searchYear = null,
            searchMonth = null,
            searchDay = null;
        let searchHour = null,
            searchMinute = null,
            searchSecond = null;

        // Check if the query is a valid year, month, or day
        if (isNumericQuery) {
            const numQuery = parseInt(searchQuery, 10);

            // If the number is between 1 and 12, it's likely a month (e.g., "10" is October)
            if (numQuery >= 1 && numQuery <= 12) {
                searchMonth = numQuery;
            }
            if (numQuery >= 1 && numQuery <= 31) {
                // If it's between 1 and 31, it's likely a day (e.g., "15" is the 15th)
                searchDay = numQuery;
            }
            if (numQuery >= 0 && numQuery <= 23) {
                // If it's between 0 and 23, it's likely an hour (e.g., "10" is 10 AM)
                searchHour = numQuery;
            }
            if (numQuery >= 0 && numQuery <= 59) {
                // If it's between 0 and 59, it's likely a minute or second
                searchMinute = numQuery;
                searchSecond = numQuery;
            }
            // Otherwise, assume it's a year (e.g., "1990")
            searchYear = numQuery;
        }

        const searchConditions = columnsResult.recordset
            .map((row) => {
                const columnName = row.COLUMN_NAME;
                const dataType = row.DATA_TYPE;

                // Text-based search for text-compatible columns
                if (
                    ['nvarchar', 'varchar', 'text', 'ntext'].includes(dataType)
                ) {
                    return `${columnName} LIKE '%' + @search + '%'`;
                }

                // Numeric search for numeric-compatible columns
                if (
                    isNumericQuery &&
                    [
                        'int',
                        'decimal',
                        'float',
                        'numeric',
                        'bigint',
                        'smallint',
                        'tinyint',
                    ].includes(dataType)
                ) {
                    return `${columnName} = @numericSearch`;
                }

                // Bit type search
                if (dataType === 'bit') {
                    if (
                        searchQuery === '1' ||
                        searchQuery.toLowerCase() === 'true'
                    ) {
                        return `${columnName} = 1`;
                    } else if (
                        searchQuery === '0' ||
                        searchQuery.toLowerCase() === 'false'
                    ) {
                        return `${columnName} = 0`;
                    }
                }

                // Date-based search for date-compatible columns
                if (
                    [
                        'date',
                        'datetime',
                        'datetime2',
                        'smalldatetime',
                        'time',
                        'datetimeoffset',
                    ].includes(dataType)
                ) {
                    const dateConditions = [];
                    if (searchYear !== null) {
                        dateConditions.push(
                            `YEAR(${columnName}) = @yearSearch`
                        );
                    }
                    if (searchMonth !== null) {
                        dateConditions.push(
                            `MONTH(${columnName}) = @monthSearch`
                        );
                    }
                    if (searchDay !== null) {
                        dateConditions.push(`DAY(${columnName}) = @daySearch`);
                    }
                    if (dataType !== 'date') {
                        if (searchHour !== null) {
                            dateConditions.push(
                                `DATEPART(HOUR, ${columnName}) = @hourSearch`
                            );
                        }
                        if (searchMinute !== null) {
                            dateConditions.push(
                                `DATEPART(MINUTE, ${columnName}) = @minuteSearch`
                            );
                        }
                        if (searchSecond !== null) {
                            dateConditions.push(
                                `DATEPART(SECOND, ${columnName}) = @secondSearch`
                            );
                        }
                    }
                    if (dateConditions.length > 0)
                        return `(${dateConditions.join(' OR ')})`;
                }

                // Uniqueidentifier search
                if (
                    dataType === 'uniqueidentifier' &&
                    /^[0-9a-fA-F-]{36}$/.test(searchQuery)
                ) {
                    return `${columnName} = @guidSearch`;
                }

                return null;
            })
            .filter(Boolean)
            .join(' OR ');

        if (!searchConditions) {
            return res
                .status(400)
                .json({ message: 'No searchable fields found for query' });
        }

        const searchSQL = `SELECT * FROM ${tableName} WHERE ${searchConditions} ORDER BY ${columnsResult.recordset[0].COLUMN_NAME} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        const countQuery = `SELECT COUNT(*) as totalCount FROM ${tableName} WHERE ${searchConditions}`;

        request.input('search', mssql.NVarChar, searchQuery);
        if (isNumericQuery) {
            request.input('numericSearch', mssql.Float, Number(searchQuery));
        }

        if (searchYear) request.input('yearSearch', mssql.Int, searchYear);
        if (searchMonth) request.input('monthSearch', mssql.Int, searchMonth);
        if (searchDay) request.input('daySearch', mssql.Int, searchDay);
        if (searchHour) request.input('hourSearch', mssql.Int, searchHour);
        if (searchMinute)
            request.input('minuteSearch', mssql.Int, searchMinute);
        if (searchSecond)
            request.input('secondSearch', mssql.Int, searchSecond);

        if (/^[0-9a-fA-F-]{36}$/.test(searchQuery)) {
            request.input('guidSearch', mssql.UniqueIdentifier, searchQuery);
        }
        request.input('limit', mssql.Int, limit);
        request.input('offset', mssql.Int, offset);

        const result = await request.query(searchSQL);

        const totalCountResult = await request.query(countQuery);
        const totalCount = totalCountResult.recordset[0].totalCount;
        res.status(200).json({
            rows: result.recordset,
            totalCount,
        });
    } catch (error) {
        console.error('Error searching rows:', error);
        res.status(500).json({ message: 'Error searching rows', error });
    }
};

module.exports = { getSearchData };
