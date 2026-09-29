using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;

namespace POSBILLING_WEB.Data
{
    public class DbHelper
    {
        //private readonly IConfiguration _configuration;

        //public DbHelper(IConfiguration configuration)
        //{
        //    _configuration = configuration;
        //}

        //public async Task<DataTable> ExecuteSPAsync(string ConnectionName,string ProcedureName,params SqlParameter[] parameters)
        //{
        //    string ConnectionString = _configuration.GetConnectionString(ConnectionName);

        //    DataTable DataTable = new DataTable();

        //    using SqlConnection Connection = new SqlConnection(ConnectionString);

        //    using SqlCommand Command = new SqlCommand(ProcedureName, Connection);

        //    Command.CommandType = CommandType.StoredProcedure;

        //    if (parameters != null && parameters.Length > 0)
        //    {
        //        Command.Parameters.AddRange(parameters);
        //    }

        //    await Connection.OpenAsync();

        //    using SqlDataReader Reader = await Command.ExecuteReaderAsync();

        //    DataTable.Load(Reader);

        //    return DataTable;
        //}

        private readonly IConfiguration _configuration;

        public DbHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<DataTable> ExecuteSPAsync(string ConnectionName, string ProcedureName,params SqlParameter[] parameters)
        {
            DataTable dataTable = new DataTable();

            string ConnectionString = _configuration.GetConnectionString(ConnectionName);

            using SqlConnection connection = new SqlConnection(ConnectionString);
            using SqlCommand command = new SqlCommand(ProcedureName, connection);
            command.CommandType = CommandType.StoredProcedure;

            if (parameters != null && parameters.Length > 0)
            {
                command.Parameters.AddRange(parameters);
            }

            await connection.OpenAsync();

            using SqlDataReader dataReader = await command.ExecuteReaderAsync();

            dataTable.Load(dataReader);

            return dataTable;
        }
        public async Task<DataSet> ExecuteSPDataSetAsync(string connectionName,string procedureName,params SqlParameter[] parameters)
        {
            DataSet dataSet = new DataSet();

            string connectionString = _configuration.GetConnectionString(connectionName);

            using SqlConnection connection =
                new SqlConnection(connectionString);

            using SqlCommand command =
                new SqlCommand(procedureName, connection);

            command.CommandType = CommandType.StoredProcedure;

            if (parameters != null && parameters.Length > 0)
            {
                command.Parameters.AddRange(parameters);
            }

            await connection.OpenAsync();

            using SqlDataReader reader = await command.ExecuteReaderAsync();

            //do
            //{
            //    DataTable table = new DataTable();
            //    table.Load(reader);
            //    dataSet.Tables.Add(table);

            //} while (await reader.NextResultAsync());

            //return dataSet;
            do
            {
                DataTable table = new DataTable();

                // Create columns
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    table.Columns.Add(
                        reader.GetName(i),
                        reader.GetFieldType(i)
                    );
                }

                // Read rows
                while (await reader.ReadAsync())
                {
                    DataRow row = table.NewRow();

                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        row[i] = reader.IsDBNull(i)
                            ? DBNull.Value
                            : reader.GetValue(i);
                    }

                    table.Rows.Add(row);
                }

                dataSet.Tables.Add(table);

            } while (await reader.NextResultAsync());

            return dataSet;
        }
    }
}